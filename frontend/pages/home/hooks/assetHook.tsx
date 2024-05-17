import { ProtocolType, RoutingPathEnum } from "@common/const";
import { Actor, HttpAgent } from "@dfinity/agent";
import store, { useAppDispatch, useAppSelector } from "@redux/Store";
import { updateHPLBalances } from "@redux/assets/AssetActions";
import { setAccordionAssetIdx } from "@redux/assets/AssetReducer";
import { Asset, ResQueryState, SubAccount } from "@redux/models/AccountModels";
import { FungibleTokenLocal } from "@redux/models/TokenModels";
import { useEffect, useState } from "react";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { setRoutingPath } from "@redux/auth/AuthReducer";
import { AuthClient } from "@dfinity/auth-client";
import { HTTP_AGENT_HOST } from "@redux/CheckAuth";
import { setHPLAssets, setHPLDictionary } from "@redux/hpl/HplReducer";
import { setProtocol } from "@redux/common/CommonReducer";
import { getFtsFormated, parseFungibleToken } from "@common/utils/hpl";

export const AssetHook = () => {
  const dispatch = useAppDispatch();
  const { subaccounts, exchangeLinks, dictionaryHplFTs, ingressActor, ownersActor, hplFTsData } = useAppSelector(
    (state) => state.hpl,
  );
  const { list } = useAppSelector((state) => state.asset);
  const { userAgent, authClient, route } = useAppSelector((state) => state.auth);
  const { hplContacts } = useAppSelector((state) => state.contacts);
  const { isAppDataFreshing, protocol } = useAppSelector((state) => state.common);

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
      let newAgent = userAgent;
      if (route === RoutingPathEnum.Enum.LOGIN) {
        const authClient = await AuthClient.create();
        newAgent = new HttpAgent({
          identity: authClient.getIdentity(),
          host: HTTP_AGENT_HOST,
        });
      }
      const dictActor = Actor.createActor<DictionaryActor>(DictionaryIDLFactory, {
        agent: newAgent,
        canisterId: dict,
      });
      const dictFTs = await dictActor.allTokens();
      localStorage.setItem("hpl-dict-pric-" + authClient, dict);
      parsedFungibleTokens = parseFungibleToken(dictFTs);
    }
    dispatch(setHPLDictionary(parsedFungibleTokens));

    if (route !== RoutingPathEnum.Enum.LOGIN) {
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
    }
  };

  const setProtocolType = (prot: ProtocolType) => {
    dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
    dispatch(setProtocol(prot));
  };

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
    isAppDataFreshing,
    setAcordeonIdx,
    assetInfo,
    setAssetInfo,
    editNameId,
    setEditNameId,
    name,
    setName,
    newSub,
    setNewSub,
    hexChecked,
    setHexChecked,
    list,
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
