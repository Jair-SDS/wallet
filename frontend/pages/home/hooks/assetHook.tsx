import { ProtocolType, ProtocolTypeEnum, RoutingPathEnum } from "@/const";
import { getFtsFormated, parseFungibleToken } from "@/utils";
import { Actor } from "@dfinity/agent";
import store, { useAppDispatch, useAppSelector } from "@redux/Store";
import { updateHPLBalances } from "@redux/assets/AssetActions";
import {
  setAccordionAssetIdx,
  setHPLAssets,
  setHPLDictionary,
  setProtocol,
  setSelectedAccount,
  setSelectedAsset,
} from "@redux/assets/AssetReducer";
import { Asset, ResQueryState, SubAccount } from "@redux/models/AccountModels";
import { FungibleTokenLocal } from "@redux/models/TokenModels";
import { useEffect, useState } from "react";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { setRoutingPath } from "@redux/auth/AuthReducer";

export const AssetHook = () => {
  const dispatch = useAppDispatch();
  const {
    protocol,
    assets,
    subaccounts,
    exchangeLinks,
    selectedAsset,
    selectedAccount,
    accordionIndex,
    tokensMarket,
    dictionaryHplFTs,
    ingressActor,
    ownersActor,
    hplFTsData,
  } = useAppSelector((state) => state.asset);
  const { userAgent, authClient } = useAppSelector((state) => state.auth);
  const { hplContacts } = useAppSelector((state) => state.contacts);
  const { isAppDataFreshing } = useAppSelector((state) => state.common);

  const [searchKey, setSearchKey] = useState("");
  const setAcordeonIdx = (assetIdx: string[]) => dispatch(setAccordionAssetIdx(assetIdx));
  const [assetInfo, setAssetInfo] = useState<Asset | undefined>();

  const [editNameId, setEditNameId] = useState("");
  const [name, setName] = useState("");
  const [newSub, setNewSub] = useState<SubAccount | undefined>();
  const [hexChecked, setHexChecked] = useState<boolean>(false);
  const [ftsUsed, setFtsUsed] = useState<number>(0);

  const reloadOnlyHPLBallance = async () => {
    await updateHPLBalances(ingressActor, ownersActor, hplContacts, authClient);
  };

  const reloadDictFts = async (dict?: string) => {
    let parsedFungibleTokens: FungibleTokenLocal[] = [];
    if (dict) {
      const dictActor = Actor.createActor<DictionaryActor>(DictionaryIDLFactory, {
        agent: userAgent,
        canisterId: dict,
      });
      const dictFTs = await dictActor.allTokens();
      localStorage.setItem("hpl-dict-pric-" + authClient, dict);
      parsedFungibleTokens = parseFungibleToken(dictFTs);
    }
    dispatch(setHPLDictionary(parsedFungibleTokens));

    const state: ResQueryState = { ftSupplies: [], virtualAccounts: [], accounts: [], remoteAccounts: [] };
    try {
      const auxState = await ingressActor.state({
        ftSupplies: [{ idRange: [BigInt(0), []] }],
        virtualAccounts: [],
        accounts: [],
        remoteAccounts: [],
      });
      state.ftSupplies = auxState.ftSupplies;
      state.virtualAccounts = auxState.virtualAccounts;
      state.accounts = auxState.accounts;
      state.remoteAccounts = auxState.remoteAccounts as any;
    } catch (e) {
      console.log("errState", e);
    }
    let adminAccountState: Array<[bigint, { ft: bigint }]> = [];
    try {
      const adminState = await ingressActor.adminState({
        ftSupplies: [],
        virtualAccounts: [],
        accounts: [{ idRange: [BigInt(0), []] }],
        remoteAccounts: [],
      });
      adminAccountState = adminState.accounts;
    } catch (e) {
      console.log("errState", e);
    }

    const auxFT = getFtsFormated(state.ftSupplies, hplFTsData, parsedFungibleTokens, adminAccountState);
    store.dispatch(setHPLAssets(auxFT));
  };

  const setProtocolType = (prot: ProtocolType) => {
    dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
    dispatch(setProtocol(prot));
  };

  useEffect(() => {
    if (protocol === ProtocolTypeEnum.Enum.ICRC1) {
      const auxAssets = assets.filter((asset) => {
        let includeInSub = false;
        asset.subAccounts.map((sa) => {
          if (sa.name.toLowerCase().includes(searchKey.toLowerCase())) includeInSub = true;
        });

        return asset.name.toLowerCase().includes(searchKey.toLowerCase()) || includeInSub || searchKey === "";
      });

      if (auxAssets.length > 0) {
        const auxAccordion: string[] = [];
        auxAssets.map((ast) => {
          if (accordionIndex.includes(ast.tokenSymbol)) auxAccordion.push(ast.tokenSymbol);
        });
        setAcordeonIdx(auxAccordion);

        const isSelected = auxAssets.find((ast) => ast.tokenSymbol === selectedAsset?.tokenSymbol);
        if (selectedAsset && !isSelected) {
          dispatch(setSelectedAsset(auxAssets[0]));
          auxAssets[0].subAccounts.length > 0 && dispatch(setSelectedAccount(auxAssets[0].subAccounts[0]));
        }
      }
    }
  }, [searchKey]);

  useEffect(() => {
    let count = 0;
    const auxGroup = subaccounts.reduce((group, sub) => {
      group[sub.ft] = group[sub.ft] ?? [];
      group[sub.ft].push(sub);
      return group;
    }, Object.create(null));
    Object.keys(auxGroup).forEach(() => {
      count++;
    });
    setFtsUsed(count);
  }, [subaccounts]);

  return {
    protocol,
    reloadOnlyHPLBallance,
    searchKey,
    setSearchKey,
    // ICRC1
    assets,
    isAppDataFreshing,
    selectedAsset,
    selectedAccount,
    accordionIndex,
    setAcordeonIdx,
    assetInfo,
    setAssetInfo,
    tokensMarket,
    editNameId,
    setEditNameId,
    name,
    setName,
    newSub,
    setNewSub,
    hexChecked,
    setHexChecked,
    // HPL
    setProtocolType,
    subaccounts,
    exchangeLinks,
    dictionaryHplFTs,
    hplFTsData,
    ftsUsed,
    reloadDictFts,
  };
};
