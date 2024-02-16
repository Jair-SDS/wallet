import { ProtocolType, ProtocolTypeEnum, RoutingPathEnum } from "@/const";
import { defaultTokens } from "@/defaultTokens";
import contactCacheRefresh from "@pages/contacts/helpers/contacts";
import store, { useAppDispatch, useAppSelector } from "@redux/Store";
import { updateAllBalances, updateHPLBalances } from "@redux/assets/AssetActions";
import {
  removeToken,
  setAcordeonAssetIdx,
  setLoading,
  setProtocol,
  setSelectedAccount,
  setSelectedAsset,
} from "@redux/assets/AssetReducer";
import { setRoutingPath } from "@redux/auth/AuthReducer";
import { Asset, SubAccount } from "@redux/models/AccountModels";
import { Token } from "@redux/models/TokenModels";
import { useEffect, useState } from "react";
import { allowanceCacheRefresh } from "../helpers/allowanceCache";
import { db } from "@/database/db";

export const AssetHook = () => {
  const dispatch = useAppDispatch();
  const {
    protocol,
    tokens,
    assets,
    assetLoading,
    selectedAsset,
    selectedAccount,
    acordeonIdx,
    tokensMarket,
    subaccounts,
    dictionaryHplFTs,
    ingressActor,
    ownersActor,
    hplFTsData,
  } = useAppSelector((state) => state.asset);
  const { userAgent, authClient } = useAppSelector((state) => state.auth);
  const { hplContacts } = useAppSelector((state) => state.contacts);
  const deleteAsset = (symb: string, address: string) => {
    dispatch(removeToken(symb));
    db().deleteToken(address).then();
  };

  const [searchKey, setSearchKey] = useState("");
  const setAcordeonIdx = (assetIdx: string[]) => dispatch(setAcordeonAssetIdx(assetIdx));
  const setProtocolType = (prot: ProtocolType) => {
    dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
    dispatch(setProtocol(prot));
  };
  const [assetInfo, setAssetInfo] = useState<Asset | undefined>();

  const [editNameId, setEditNameId] = useState("");
  const [name, setName] = useState("");
  const [newSub, setNewSub] = useState<SubAccount | undefined>();
  const [hexChecked, setHexChecked] = useState<boolean>(false);
  const [ftsUsed, setFtsUsed] = useState<number>(0);

  const reloadBallance = async (tkns?: Token[]) => {
    dispatch(setLoading(true));
    updateAllBalances(userAgent, tkns ? tkns : tokens.length > 0 ? tokens : defaultTokens);
    updateHPLBalances(ingressActor, ownersActor, hplContacts, authClient);
    const principal = store.getState().auth.userPrincipal.toText();
    await allowanceCacheRefresh(principal);
    await contactCacheRefresh();
    dispatch(setLoading(false));
  };

  const reloadOnlyICRCBallance = async (tkns?: Token[]) => {
    dispatch(setLoading(true));
    updateAllBalances(userAgent, tkns ? tkns : tokens.length > 0 ? tokens : defaultTokens);
    const principal = (await userAgent.getPrincipal()).toText();
    allowanceCacheRefresh(principal);
    await contactCacheRefresh();
  };

  const reloadOnlyHPLBallance = () => {
    updateHPLBalances(ingressActor, ownersActor, hplContacts, authClient);
  };

  const getTotalAmountInCurrency = () => {
    let amount = 0;
    assets.map((tk) => {
      const market = tokensMarket.find((tm) => tm.symbol === tk.tokenSymbol);
      let assetTotal = BigInt(0);
      tk.subAccounts.map((sa) => {
        assetTotal = assetTotal + BigInt(sa.amount);
      });
      amount =
        amount + (market ? (Number(assetTotal.toString()) * market.price) / Math.pow(10, Number(tk.decimal)) : 0);
    });
    return Math.round(amount * 100) / 100;
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
          if (acordeonIdx.includes(ast.tokenSymbol)) auxAccordion.push(ast.tokenSymbol);
        });
        setAcordeonIdx(auxAccordion);

        const isSelected = auxAssets.find((ast) => ast.tokenSymbol === selectedAsset?.tokenSymbol);
        if (selectedAsset && !isSelected) {
          dispatch(setSelectedAsset(auxAssets[0]));
          auxAssets[0].subAccounts.length > 0 && dispatch(setSelectedAccount(auxAssets[0].subAccounts[0]));
        }
      } else {
        setAcordeonIdx([]);
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
    setProtocolType,
    reloadBallance,
    reloadOnlyICRCBallance,
    reloadOnlyHPLBallance,
    searchKey,
    setSearchKey,
    // ICRC1
    tokens,
    assets,
    assetLoading,
    selectedAsset,
    selectedAccount,
    acordeonIdx,
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
    getTotalAmountInCurrency,
    deleteAsset,
    // HPL
    subaccounts,
    dictionaryHplFTs,
    hplFTsData,
    ftsUsed,
  };
};
