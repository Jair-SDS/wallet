import { useAppDispatch, useAppSelector } from "@redux/Store";
import { updateHPLBalances } from "@redux/assets/AssetActions";
import { setHPLSelectedSub, setLoading } from "@redux/assets/AssetReducer";
import { HPLAsset, HPLSubAccount } from "@redux/models/AccountModels";
import { useEffect, useState } from "react";

export const useHPL = (open: boolean) => {
  const dispatch = useAppDispatch();

  const { userAgent } = useAppSelector((state) => state.auth);
  const { subaccounts, ingressActor, hplFTs, selectSub } = useAppSelector((state) => state.asset);
  const [selAssetOpen, setSelAssetOpen] = useState(false);
  const [selAssetSearch, setSelAssetSearch] = useState("");
  const [addSubErr, setAddSubErr] = useState("");
  const [selAsset, setSelAsset] = useState<HPLAsset | undefined>();
  const [editedFt, setEditedFt] = useState<HPLAsset | undefined>();

  const [newHplSub, setNewHplSub] = useState<HPLSubAccount>({
    name: "",
    sub_account_id: BigInt(0),
    amount: BigInt(0),
    currency_amount: "0",
    transaction_fee: "0",
    decimal: 0,
    symbol: "0",
    ft: BigInt(-1),
    virtuals: [],
    logo: "",
  });

  const setSelSub = (sub: HPLSubAccount | undefined) => {
    dispatch(setHPLSelectedSub(sub));
  };

  useEffect(() => {
    if (!selAssetOpen) {
      setNewHplSub({
        name: "",
        sub_account_id: BigInt(0),
        amount: BigInt(0),
        currency_amount: "0",
        transaction_fee: "0",
        decimal: 0,
        symbol: "0",
        ft: BigInt(-1),
        virtuals: [],
        logo: "",
      });
      setAddSubErr("");
      setSelAssetSearch("");
      setSelAsset(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (!selectSub && subaccounts.length > 0) setSelSub(subaccounts[0]);
  }, [subaccounts]);

  const reloadHPLBallance = () => {
    dispatch(setLoading(true));
    updateHPLBalances(userAgent);
  };

  return {
    ingressActor,
    subaccounts,
    hplFTs,
    selAsset,
    setSelAsset,
    selAssetOpen,
    setSelAssetOpen,
    selAssetSearch,
    setSelAssetSearch,
    newHplSub,
    setNewHplSub,
    addSubErr,
    setAddSubErr,
    selectSub,
    setSelSub,
    editedFt,
    setEditedFt,
    reloadHPLBallance,
  };
};
