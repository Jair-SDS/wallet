import { useAppDispatch, useAppSelector } from "@redux/Store";
import { setAllAssetsView } from "@redux/assets/AssetReducer";
import { HPLAsset } from "@redux/models/AccountModels";
import { useEffect, useState } from "react";

export const useAssetList = () => {
  const dispatch = useAppDispatch();

  const { dictionaryHplFTs, hplFTs, subaccounts, allAssetsView } = useAppSelector((state) => state.asset);
  const { hplContacts } = useAppSelector((state) => state.contacts);

  const [selAsset, setSelAsset] = useState<HPLAsset | undefined>();
  const [searchKey, setSearchKey] = useState("");
  const [assetList, setAssetList] = useState<HPLAsset[]>([]);
  const [subsInAsset, setSubsInAsset] = useState<{ id: string; accounts: number }[]>([]);
  const [editView, setEditView] = useState(false);

  const setAllAssets = (value: boolean) => dispatch(setAllAssetsView(value));

  useEffect(() => {
    let auxAssetList: HPLAsset[] = [];
    const auxSubsInAsset: { id: string; accounts: number }[] = [];
    const auxSearchKey = searchKey.trim().toLowerCase();

    if (allAssetsView) auxAssetList = hplFTs;
    else {
      const index = dictionaryHplFTs.map((ft) => {
        return ft.assetId;
      });
      auxAssetList = hplFTs.filter((ft) => index.includes(ft.id));
    }

    const auxhplFTs = auxSearchKey
      ? auxAssetList.filter((ft) => {
          return (
            ft.description.toLowerCase().includes(auxSearchKey) ||
            ft.name.toLowerCase().includes(auxSearchKey) ||
            ft.symbol.toLowerCase().includes(auxSearchKey) ||
            ft.token_name.toLowerCase().includes(auxSearchKey) ||
            ft.id.toLowerCase().includes(auxSearchKey) ||
            ft.controller.toLowerCase().includes(auxSearchKey) ||
            ft.token_symbol.toLowerCase().includes(auxSearchKey)
          );
        })
      : auxAssetList;

    const auxGroup = subaccounts.reduce((group, sub) => {
      group[sub.ft] = group[sub.ft] ?? [];
      group[sub.ft].push(sub);
      return group;
    }, Object.create(null));
    Object.keys(auxGroup).forEach((key) => {
      auxSubsInAsset.push({ id: key, accounts: auxGroup[key].length || 0 });
    });

    setSubsInAsset(auxSubsInAsset);
    setAssetList(auxhplFTs);
  }, [searchKey, allAssetsView, subaccounts, hplFTs]);

  const getContactName = (principal: string) => {
    const found = hplContacts.find((cntc) => cntc.principal === principal);
    return found ? found.name : "";
  };

  return {
    dictionaryHplFTs,
    searchKey,
    setSearchKey,
    allAssetsView,
    setAllAssets,
    assetList,
    subsInAsset,
    selAsset,
    setSelAsset,
    editView,
    setEditView,
    getContactName,
  };
};
