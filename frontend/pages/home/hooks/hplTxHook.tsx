import { DrawerOption, DrawerOptionEnum, HplTransactionsEnum } from "@common/const";
import { useAppSelector } from "@redux/Store";
import { HplRemote, HplTxUser } from "@redux/models/AccountModels";
import { useEffect, useState } from "react";

export const useHPLTx = (drawerOpen: boolean, drawerOpt: DrawerOption, locat: string) => {
  const { hplClient, ingressActor, subaccounts, selectSub, ownersActor } = useAppSelector((state) => state.hpl);
  const { hplContacts } = useAppSelector((state) => state.contacts);
  const defaultUser = {
    type: HplTransactionsEnum.Enum.SUBACCOUNT,
    principal: "",
    vIdx: "",
    subaccount: undefined,
  };
  const [from, setFrom] = useState<HplTxUser>({ ...defaultUser });
  const [to, setTo] = useState<HplTxUser>({ ...defaultUser });
  const [errMsgFrom, setErrMsgFrom] = useState("");
  const [errMsgTo, setErrMsgTo] = useState("");
  const [amount, setAmount] = useState("");
  const [amountReceiver, setAmountReceiver] = useState("");

  useEffect(() => {
    if (drawerOpen)
      if (drawerOpt === DrawerOptionEnum.Enum.SEND) {
        setTo({ ...defaultUser, type: HplTransactionsEnum.Enum.VIRTUAL });
        setFrom({
          type: locat !== "remote" ? HplTransactionsEnum.Enum.SUBACCOUNT : HplTransactionsEnum.Enum.VIRTUAL,
          principal: locat !== "remote" ? "" : "selectedRemote.principal",
          vIdx: locat !== "remote" ? "" : "selectedRemote.id",
          subaccount: locat === "detail" ? selectSub : undefined,
        });
      } else {
        setFrom({ ...defaultUser, type: HplTransactionsEnum.Enum.VIRTUAL });
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
      if (from.subaccount.ft !== to.subaccount.ft) setErrMsgFrom("not.match.asset.id");
      else if (from.subaccount.sub_account_id === to.subaccount.sub_account_id) setErrMsgFrom("not.same.subaccount");
      else {
        setErrMsgFrom("");
        setErrMsgTo("");
      }
    } else {
      setErrMsgFrom("");
      setErrMsgTo("");
    }
  }, [from, to]);

  const getPrincipalFromOwnerId = async (ownerId: bigint) => {
    try {
      const princ = await ownersActor.get(ownerId);
      return princ;
    } catch {
      return undefined;
    }
  };

  const checkIfIsContact = (code: string): { rmt: HplRemote; prin: string; contactName: string } | undefined => {
    for (let i = 0; i < hplContacts.length; i++) {
      for (let j = 0; j < hplContacts[i].remotes.length; j++) {
        if (hplContacts[i].remotes[j].code === code)
          return { rmt: hplContacts[i].remotes[j], prin: hplContacts[i].principal, contactName: hplContacts[i].name };
      }
    }
    return undefined;
  };

  return {
    hplClient,
    ingressActor,
    subaccounts,
    selectSub,
    hplContacts,
    from,
    setFrom,
    to,
    setTo,
    errMsgFrom,
    setErrMsgFrom,
    errMsgTo,
    setErrMsgTo,
    amount,
    setAmount,
    amountReceiver,
    setAmountReceiver,
    getPrincipalFromOwnerId,
    checkIfIsContact,
  };
};
