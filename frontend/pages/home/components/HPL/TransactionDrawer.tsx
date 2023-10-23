// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { useHPLTx } from "@pages/home/hooks/hplTxHook";
import {
  DrawerOption,
  HplTransactionsEnum,
  HplTransactionsTypeEnum,
} from "@/const";
import { ChangeEvent, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import SelectTransfer from "./SelectTransfer";
import { CustomButton } from "@components/Button";
import QRscanner from "@pages/components/QRscanner";
import { HplTxUser } from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { TransferAccountReference } from "@research-ag/hpl-client";
import { catchError, lastValueFrom, map, of } from "rxjs";
import { CustomInput } from "@components/Input";

interface TransactionDrawerProps {
  setDrawerOpen(value: boolean): void;
  setHplTx(value: boolean): void;
  drawerOption: DrawerOption;
  drawerOpen: boolean;
  locat: string;
}

const TransactionDrawer = ({
  setDrawerOpen,
  setHplTx,
  drawerOption,
  drawerOpen,
  locat,
}: TransactionDrawerProps) => {
  const { t } = useTranslation();
  const {
    hplClient,
    subaccounts,
    from,
    setFrom,
    to,
    setTo,
    errMsg,
    setErrMsg,
    amount,
    setAmount,
  } = useHPLTx(drawerOpen, drawerOption, locat);
  const [summary, setSummary] = useState(false);
  const [qrView, setQRview] = useState("");

  return (
    <div className="flex flex-col justify-start items-between bg-PrimaryColorLight dark:bg-PrimaryColor w-full h-full pt-8 px-6 text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
      <div className="flex flex-row justify-between items-center w-full mb-3">
        <p className="text-lg font-bold">{t("transaction")}</p>
        <CloseIcon
          className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
          onClick={onClose}
        />
      </div>
      {!summary ? (
        qrView ? (
          <div className="flex flex-col justify-start items-center w-full">
            <QRscanner
              qrView={qrView !== ""}
              onSuccess={onQRSuccess}
              setQRview={setQRviewClose}
            />
          </div>
        ) : (
          <Fragment>
            <div className="flex flex-col justify-start items-center w-full">
              <SelectTransfer
                select={from}
                setSelect={setFrom}
                subaccounts={subaccounts}
                txType={HplTransactionsTypeEnum.Enum.from}
                setQRview={setQRview}
              />
              <SelectTransfer
                select={to}
                setSelect={setTo}
                subaccounts={subaccounts}
                txType={HplTransactionsTypeEnum.Enum.to}
                setQRview={setQRview}
              />
            </div>
            <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
              <p className="text-sm text-TextErrorColor text-left">
                {t(errMsg)}
              </p>
              <CustomButton
                className="min-w-[5rem]"
                onClick={onNext}
                size={"small"}
              >
                <p>{t("next")}</p>
              </CustomButton>
            </div>
          </Fragment>
        )
      ) : (
        <Fragment>
          <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColor/70 dark:text-PrimaryTextColor/70 rounded">
            <p className="text-PrimaryTextColor dark:text-PrimaryTextColor font-semibold mb-4">
              {t("from")}
            </p>
            {from.subaccount ? (
              <div className="flex flex-row justify-start items-center w-full gap-2">
                <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                  <p className=" text-PrimaryTextColor">
                    {from.subaccount.sub_account_id}
                  </p>
                </div>
                <p className="text-left text-PrimaryTextColor dark:text-PrimaryTextColor">
                  {from.subaccount.name}
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-start items-start w-full gap-3">
                <div className="flex flex-row justify-between items-center w-full">
                  <p>Principal</p>
                  <p>{from.principal}</p>
                </div>
                <div className="flex flex-row justify-between items-center w-full">
                  <p>{t("virtual")}</p>
                  <p>{from.vIdx}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColor/70 dark:text-PrimaryTextColor/70 rounded mt-4">
            <p className="text-PrimaryTextColor dark:text-PrimaryTextColor font-semibold mb-4">
              {t("to")}
            </p>
            {to.subaccount ? (
              <div className="flex flex-row justify-start items-center w-full gap-3">
                <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                  <p className=" text-PrimaryTextColor">
                    {to.subaccount.sub_account_id}
                  </p>
                </div>
                <p className="text-left text-PrimaryTextColor dark:text-PrimaryTextColor">
                  {to.subaccount.name}
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-start items-start w-full gap-2">
                <div className="flex flex-row justify-between items-center w-full">
                  <p>Principal</p>
                  <p>{to.principal}</p>
                </div>
                <div className="flex flex-row justify-between items-center w-full">
                  <p>{t("virtual")}</p>
                  <p>{to.vIdx}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-start items-start w-full mt-6 gap-2">
            <p>{t("amount")}</p>
            <CustomInput
              compOutClass="!w-2/3"
              intent={"secondary"}
              placeholder={t("amount")}
              value={amount}
              onChange={onAmountChange}
              sizeInput="small"
              border={"secondary"}
            />
          </div>
          <div className="w-full flex flex-col justify-between items-center mt-12 gap-4">
            <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
            <div className="flex flex-row justify-end items-center w-full gap-2">
              <CustomButton
                className="min-w-[5rem]"
                onClick={onBack}
                size={"small"}
              >
                <p>{t("back")}</p>
              </CustomButton>

              <CustomButton
                className="min-w-[5rem]"
                onClick={onSend}
                size={"small"}
              >
                <p>{t("send")}</p>
              </CustomButton>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );

  function onClose() {
    setDrawerOpen(false);
    setHplTx(false);
    setQRview("");
    setAmount("0");
  }
  function onNext() {
    if (!validation(from)) setErrMsg("err.from");
    else if (!validation(to)) setErrMsg("err.to");
    else if (!errMsg) {
      setSummary(true);
    }
  }
  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "" || /^\+?([0-9]\d*)$/.test(value))
      setAmount(value === "" ? "" : Number(value).toString());
  }
  function onQRSuccess(value: string) {
    const data = parseQrCode(value);
    if (!data.err) {
      if (qrView === HplTransactionsTypeEnum.Enum.from) {
        setFrom({
          type: HplTransactionsEnum.Enum.SUBACCOUNT,
          principal: data.principal,
          vIdx: data.id,
          subaccount: undefined,
        });
      } else {
        setTo({
          type: HplTransactionsEnum.Enum.SUBACCOUNT,
          principal: data.principal,
          vIdx: data.id,
          subaccount: undefined,
        });
      }
    } else {
      setErrMsg("no.valid.qr.code");
    }
    setQRview("");
  }
  function setQRviewClose(value: boolean) {
    !value && setQRview("");
  }
  function validation(data: HplTxUser) {
    switch (data.type) {
      case HplTransactionsEnum.Enum.SUBACCOUNT:
        return data.subaccount ? true : false;
      case HplTransactionsEnum.Enum.VIRTUAL:
        if (data.principal.trim() === "") return false;
        else if (data.vIdx.trim() === "") return false;
        else {
          try {
            Principal.fromText(data.principal.trim());
          } catch {
            return false;
          }
          return true;
        }
      default:
        return false;
    }
  }
  function onBack() {
    setErrMsg("");
    setSummary(false);
  }
  async function onSend() {
    let txFrom: TransferAccountReference;
    if (from.type === HplTransactionsEnum.Enum.SUBACCOUNT)
      txFrom = {
        type: "sub",
        id: BigInt(from.subaccount?.sub_account_id || "0"),
      };
    else txFrom = { type: "vir", owner: from.principal, id: BigInt(from.vIdx) };

    let txTo: TransferAccountReference;
    if (to.type === HplTransactionsEnum.Enum.SUBACCOUNT)
      txTo = { type: "sub", id: BigInt(to.subaccount?.sub_account_id || "0") };
    else txTo = { type: "vir", owner: to.principal, id: BigInt(to.vIdx) };

    // TODO: Get Asset ID
    // TODO: Get Amount

    try {
      const aggregator = await hplClient.pickAggregator();
      const assetID = "4";
      const amount = "400";
      if (aggregator) {
        const { commit } = await hplClient.prepareSimpleTransfer(
          aggregator,
          txFrom,
          txTo,
          BigInt(assetID),
          BigInt(amount)
        );
        const txId = await commit();
        await lastValueFrom(
          hplClient.pollTx(aggregator, txId!).pipe(
            map((x) => {
              console.log(x.status);
            }),
            catchError((err: any) => {
              console.log(err);
              return of(null);
            })
          )
        );
      }
    } catch (e) {
      console.log("txErr: ", e);
    }
  }

  function parseQrCode(code: string) {
    const decode = code.split(".");
    try {
      Principal.fromText(code[0]);
    } catch {
      return { principal: "", id: "", err: true };
    }
    if (decode.length === 1) return { principal: code[0], id: "", err: false };
    else if (decode.length === 3 && /^\+?([0-9]\d*)$/.test(decode[2])) {
      return {
        principal: code[0],
        id: decode[2],
        err: false,
      };
    } else return { principal: "", id: "", err: true };
  }
};

export default TransactionDrawer;
