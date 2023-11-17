// svgs
import { SubaccountInfo, SubaccountInfoEnum } from "@/const";
import { validateAmount } from "@/utils";
import HplDefaultIcon from "@assets/svg/files/defaultHPL.svg";
import { Principal } from "@dfinity/principal";
//
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { updateHPLBalances } from "@redux/assets/AssetActions";
import {
  editHPLAsset,
  editHPLSub,
  setHPLSelectedSub,
  setHPLSelectedVt,
  setHPLSubsData,
  setHPLVTsData,
  setLoading,
} from "@redux/assets/AssetReducer";
import {
  HPLAsset,
  HPLAssetData,
  HPLSubAccount,
  HPLSubData,
  HPLVirtualData,
  HPLVirtualSubAcc,
} from "@redux/models/AccountModels";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";

export const useHPL = (open: boolean) => {
  const dispatch = useAppDispatch();
  const { protocol, subaccounts, hplFTs, selectSub, selectVt, hplFTsData, hplSubsData, hplVTsData, ingressActor } =
    useAppSelector((state) => state.asset);
  const [subsList, setSubsList] = useState<HPLSubAccount[]>([]);
  const [selAssetOpen, setSelAssetOpen] = useState(false);
  const [selAssetSearch, setSelAssetSearch] = useState("");
  const [editNameId, setEditNameId] = useState("");
  const [editSubName, setEditSubName] = useState("");
  const [addSubErr, setAddSubErr] = useState("");
  const [sortVt, setSortVt] = useState(0);
  const [subInfoType, setSubInfoType] = useState<SubaccountInfo>(SubaccountInfoEnum.Enum.VIRTUALS);
  const [selAsset, setSelAsset] = useState<HPLAsset | undefined>();
  const [editedFt, setEditedFt] = useState<HPLAsset | undefined>();
  const [searchKeyHPL, setSearchKeyHPL] = useState("");
  const [expiration, setExpiration] = useState(true);
  const [accesErr, setAccesErr] = useState(false);
  const [newVt, setNewVt] = useState<HPLVirtualSubAcc>({
    virt_sub_acc_id: "",
    name: "",
    amount: "",
    currency_amount: "",
    expiration: 0,
    accesBy: "",
    backing: "",
  });

  const [newHplSub, setNewHplSub] = useState<HPLSubAccount>({
    name: "",
    sub_account_id: "0",
    amount: "0",
    currency_amount: "0",
    transaction_fee: "0",
    ft: "-1",
    virtuals: [],
  });

  let enableZeroBalance = false;
  if (localStorage.getItem("enableZeroBalance") !== null) {
    enableZeroBalance = JSON.parse(localStorage.getItem("enableZeroBalance") ?? "");
  }
  const [zeroBalance, setZeroBalance] = useState(enableZeroBalance);

  const setSelSub = (sub: HPLSubAccount | undefined) => {
    dispatch(setHPLSelectedSub(sub));
  };

  const setSelVt = (vt: HPLVirtualSubAcc | undefined) => {
    dispatch(setHPLSelectedVt(vt));
  };

  const editSelAsset = (ft: HPLAsset, ftData: HPLAssetData[]) => {
    dispatch(editHPLAsset(ft, ftData));
  };

  const editSelSub = (subEdited: HPLSubAccount, subData: HPLSubData[]) => {
    dispatch(editHPLSub(subEdited, subData));
  };

  const editSubData = (subData: HPLSubData[]) => {
    dispatch(setHPLSubsData(subData));
  };

  const editVtData = (vtData: HPLVirtualData[]) => {
    dispatch(setHPLVTsData(vtData));
  };

  useEffect(() => {
    if (!selAssetOpen) {
      setNewHplSub({
        name: "",
        sub_account_id: "0",
        amount: "0",
        currency_amount: "0",
        transaction_fee: "0",
        ft: "-1",
        virtuals: [],
      });
      setAddSubErr("");
      setSelAssetSearch("");
      setSelAsset(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (!selectSub && subaccounts.length > 0) setSelSub(subaccounts[0]);
  }, [subaccounts]);

  useEffect(() => {
    const auxSubs = subaccounts?.filter((sub: HPLSubAccount) => {
      let includeInSub = false;
      sub.virtuals.map((vt) => {
        if (vt.name.toLowerCase().includes(searchKeyHPL.toLowerCase())) includeInSub = true;
      });

      // search by currency name
      const subAccountCurrencyName = getFtFromSub(sub.ft)?.name ?? null;
      if (subAccountCurrencyName && partialMatch(subAccountCurrencyName, searchKeyHPL)) includeInSub = true;
      // search by currency symbol
      const subAccountCurrencySymbol = getFtFromSub(sub.ft)?.symbol ?? null;
      if (subAccountCurrencySymbol && partialMatch(subAccountCurrencySymbol, searchKeyHPL)) includeInSub = true;
      // search by sub account id
      if (partialMatch(sub.sub_account_id, searchKeyHPL)) includeInSub = true;

      let zero = true;

      if (zeroBalance && BigInt(sub.amount) === BigInt(0)) zero = false;

      if ((sub.name.toLowerCase().includes(searchKeyHPL.toLowerCase()) || includeInSub || searchKeyHPL === "") && zero)
        return true;
    });
    setSubsList(auxSubs);
    const isSelected = auxSubs.find((sub) => sub.sub_account_id === selectSub?.sub_account_id);
    if (!isSelected) {
      if (auxSubs.length > 0) setSelSub(auxSubs[0]);
      else setSelSub(undefined);
    }
  }, [zeroBalance, searchKeyHPL, subaccounts]);

  const reloadHPLBallance = async () => {
    dispatch(setLoading(true));
    const { subs } = await updateHPLBalances(ingressActor);
    if (selectSub) {
      const auxSub = subs.find((sub) => sub.sub_account_id === selectSub.sub_account_id);
      setSelSub(auxSub);
      setSelVt(undefined);
    }
    dispatch(setLoading(false));
  };

  const getFtFromSub = (sub: string) => {
    return (
      hplFTs.find((ft) => ft.id === sub) || {
        id: "",
        name: "",
        token_name: "",
        symbol: "",
        token_symbol: "",
        decimal: 0,
        description: "",
        logo: "",
      }
    );
  };
  const getSubFromVt = (backing: string) => {
    return (
      subaccounts.find((sub) => sub.sub_account_id === backing) || {
        sub_account_id: "",
        name: "",
        amount: "0",
        currency_amount: "0",
        transaction_fee: "0",
        ft: "0",
        virtuals: [],
      }
    );
  };
  const getFtFromVt = (backing: string) => {
    return getFtFromSub(getSubFromVt(backing).ft);
  };

  const getAssetLogo = (id: string) => {
    const ft = hplFTs.find((ft) => ft.id === id);
    if (ft) {
      return ft.logo != "" ? ft.logo : HplDefaultIcon;
    } else {
      return HplDefaultIcon;
    }
  };

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setNewVt((prev) => {
      return { ...prev, name: e.target.value };
    });
  }
  function onBalanceChange(e: ChangeEvent<HTMLInputElement>) {
    const amnt = e.target.value;
    if (validateAmount(amnt, getFtFromSub(selectSub?.ft || "0").decimal) || amnt === "")
      setNewVt((prev) => {
        return { ...prev, amount: e.target.value.trim() };
      });
  }
  function onDateChange(value: dayjs.Dayjs | null) {
    setNewVt((prev) => {
      return { ...prev, expiration: value ? value.valueOf() : 0 };
    });
  }
  function onChangeExpirationCheck() {
    setNewVt((prev) => {
      return { ...prev, expiration: expiration ? dayjs().valueOf() : 0 };
    });
    setExpiration(!expiration);
  }
  function onAccesChange(e: ChangeEvent<HTMLInputElement>) {
    setNewVt((prev) => {
      return { ...prev, accesBy: e.target.value.trim() };
    });
    if (e.target.value.trim() !== "")
      try {
        Principal.fromText(e.target.value.trim());
        setAccesErr(false);
      } catch {
        setAccesErr(true);
      }
    else setAccesErr(false);
  }

  function partialMatch(str: string, partial: string) {
    // Escape special characters in the partial string
    const escapedPartial = partial.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Create a case-insensitive regular expression
    const regex = new RegExp(escapedPartial, "ig");

    // Test if the string matches the partial string
    return regex.test(str);
  }

  return {
    protocol,
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
    selectVt,
    editedFt,
    setSelVt,
    setEditedFt,
    editSelAsset,
    editSelSub,
    editSubData,
    editVtData,
    getFtFromSub,
    getSubFromVt,
    getFtFromVt,
    hplFTsData,
    hplSubsData,
    hplVTsData,
    editNameId,
    setEditNameId,
    editSubName,
    setEditSubName,
    getAssetLogo,
    subInfoType,
    setSubInfoType,
    sortVt,
    setSortVt,
    newVt,
    setNewVt,
    zeroBalance,
    setZeroBalance,
    searchKeyHPL,
    setSearchKeyHPL,
    subsList,
    expiration,
    setExpiration,
    onNameChange,
    onBalanceChange,
    onDateChange,
    onChangeExpirationCheck,
    onAccesChange,
    accesErr,
    setAccesErr,
    reloadHPLBallance,
  };
};
