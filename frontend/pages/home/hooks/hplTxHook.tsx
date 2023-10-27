import { DrawerOption, DrawerOptionEnum, HplTransactionsEnum } from "@/const";
import { useAppSelector } from "@redux/Store";
import { HplTxUser } from "@redux/models/AccountModels";
import { useEffect, useState } from "react";

export const useHPLTx = (drawerOpen: boolean, drawerOpt: DrawerOption, locat: string) => {
  const { hplClient, subaccounts, selectSub } = useAppSelector((state) => state.asset);
  const { hplContacts } = useAppSelector((state) => state.contacts);
  const defaultUser = {
    type: HplTransactionsEnum.Enum.SUBACCOUNT,
    principal: "",
    vIdx: "",
    subaccount: undefined,
  };
  const [from, setFrom] = useState<HplTxUser>({
    type: HplTransactionsEnum.Enum.SUBACCOUNT,
    principal: "",
    vIdx: "",
    subaccount: undefined,
  });
  const [to, setTo] = useState<HplTxUser>({
    type: HplTransactionsEnum.Enum.SUBACCOUNT,
    principal: "",
    vIdx: "",
    subaccount: undefined,
  });
  const [errMsg, setErrMsg] = useState("");
  const [amount, setAmount] = useState("0");

  useEffect(() => {
    if (drawerOpen)
      if (drawerOpt === DrawerOptionEnum.Enum.SEND) {
        setTo(defaultUser);
        setFrom({
          type: locat !== "remote" ? HplTransactionsEnum.Enum.SUBACCOUNT : HplTransactionsEnum.Enum.VIRTUAL,
          principal: locat !== "remote" ? "" : "selectedRemote.principal",
          vIdx: locat !== "remote" ? "" : "selectedRemote.id",
          subaccount: locat === "detail" ? selectSub : undefined,
        });
      } else {
        setFrom(defaultUser);
        setTo({
          type: locat !== "remote" ? HplTransactionsEnum.Enum.SUBACCOUNT : HplTransactionsEnum.Enum.VIRTUAL,
          principal: locat !== "remote" ? "" : "selectedRemote.principal",
          vIdx: locat !== "remote" ? "" : "selectedRemote.id",
          subaccount: locat === "detail" ? selectSub : undefined,
        });
      }
  }, [drawerOpen]);

  useEffect(() => {
    if (from.subaccount && to.subaccount) {
      if (from.subaccount.ft !== to.subaccount.ft) setErrMsg("not.match.asset.id");
      else if (from.subaccount.sub_account_id === to.subaccount.sub_account_id) setErrMsg("not.same.subaccount");
      else setErrMsg("");
    } else setErrMsg("");
  }, [from, to]);

  return {
    hplClient,
    subaccounts,
    selectSub,
    hplContacts,
    from,
    setFrom,
    to,
    setTo,
    errMsg,
    setErrMsg,
    amount,
    setAmount,
  };
};
