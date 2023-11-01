// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { ReactComponent as ExchangeIcon } from "@assets/svg/files/arrows-exchange-v.svg";
import { ReactComponent as DownBlueArrow } from "@assets/svg/files/down-blue-arrow.svg";
import { ReactComponent as GreenCheck } from "@assets/svg/files/green_check.svg";
//
import { useHPLTx } from "@pages/home/hooks/hplTxHook";
import { DrawerOption, HplTransactionsEnum, HplTransactionsTypeEnum } from "@/const";
import { ChangeEvent, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import SelectTransfer from "./SelectTransfer";
import { CustomButton } from "@components/Button";
import QRscanner from "@pages/components/QRscanner";
import { HplTxUser } from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { TransferAccountReference } from "@research-ag/hpl-client";
import { CustomInput } from "@components/Input";
import { useHPL } from "@pages/hooks/hplHook";
import { shortAddress } from "@/utils";
import LoadingLoader from "@components/Loader";
import { catchError, lastValueFrom, map, of } from "rxjs";

interface TransactionDrawerProps {
  setDrawerOpen(value: boolean): void;
  drawerOption: DrawerOption;
  drawerOpen: boolean;
  locat: string;
}

const TransactionDrawer = ({ setDrawerOpen, drawerOption, drawerOpen, locat }: TransactionDrawerProps) => {
  const { t } = useTranslation();
  const { hplClient, subaccounts, from, setFrom, to, setTo, errMsg, setErrMsg, amount, setAmount, hplContacts } =
    useHPLTx(drawerOpen, drawerOption, locat);
  const { getAssetLogo, getFtFromSub, reloadHPLBallance } = useHPL(false);
  const [summary, setSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrView, setQRview] = useState("");
  const [remoteAmount] = useState("0");
  const [ftId, setFtId] = useState("0");
  const [decimals, setDecimals] = useState(0);

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
            <QRscanner qrView={qrView !== ""} onSuccess={onQRSuccess} setQRview={setQRviewClose} />
          </div>
        ) : (
          <Fragment>
            <div className="flex flex-col justify-start items-center w-full">
              <SelectTransfer
                getAssetLogo={getAssetLogo}
                getFtFromSub={getFtFromSub}
                select={from}
                hplContacts={hplContacts}
                setSelect={setFrom}
                subaccounts={subaccounts}
                txType={HplTransactionsTypeEnum.Enum.from}
                setQRview={setQRview}
              />
              <SelectTransfer
                getAssetLogo={getAssetLogo}
                getFtFromSub={getFtFromSub}
                select={to}
                hplContacts={hplContacts}
                setSelect={setTo}
                subaccounts={subaccounts}
                txType={HplTransactionsTypeEnum.Enum.to}
                setQRview={setQRview}
              />
            </div>
            <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
              <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
              <CustomButton className="min-w-[5rem]" onClick={onNext} size={"small"}>
                <p>{t("next")}</p>
              </CustomButton>
            </div>
          </Fragment>
        )
      ) : (
        <Fragment>
          <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColor/70 dark:text-PrimaryTextColor/70 rounded">
            <p className="font-semibold mb-2 ">{t("from")}</p>
            {from.subaccount ? (
              <div className="flex flex-row justify-start items-center w-full gap-5">
                <img src={getAssetLogo(from.subaccount.ft)} className="w-8 h-8" alt="info-icon" />
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <div className="flex justify-center items-center  px-1 bg-slate-500 rounded">
                      <p className=" text-PrimaryTextColor">{from.subaccount.sub_account_id}</p>
                    </div>
                    <p className="text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor">
                      {from.subaccount.name}
                    </p>
                  </div>
                  <p className="opacity-70">{`${from.subaccount.amount} ${getFtFromSub(from.subaccount.ft).symbol}`}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-start items-start w-full gap-3">
                <div className="flex flex-row justify-between items-center w-full opacity-70">
                  <p>Principal</p>
                  <p className="text-right">{shortAddress(from.principal, 12, 10)}</p>
                </div>
                <div className="flex flex-row justify-between items-center w-full border-b border-b-BorderColor/70 pb-3">
                  <p className="opacity-70">{t("virtual")}</p>
                  <p>{from.vIdx}</p>
                </div>
                {from.remote && (
                  <div className="flex flex-row justify-between items-center w-full">
                    <p>{from.remote.name}</p>
                    <GreenCheck />
                  </div>
                )}
                <p className="text-RemoteAmount/70">{remoteAmount}</p>
              </div>
            )}
          </div>
          <div className="flex flex-row justify-center items-center w-full mt-3">
            <DownBlueArrow />
          </div>
          <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColor/70 dark:text-PrimaryTextColor/70 rounded mt-3">
            <p className="font-semibold mb-2">{t("to")}</p>
            {to.subaccount ? (
              <div className="flex flex-row justify-start items-center w-full gap-5">
                <img src={getAssetLogo(to.subaccount.ft)} className="w-8 h-8" alt="info-icon" />
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <div className="flex justify-center items-center  px-1 bg-slate-500 rounded">
                      <p className=" text-PrimaryTextColor">{to.subaccount.sub_account_id}</p>
                    </div>
                    <p className="text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor">
                      {to.subaccount.name}
                    </p>
                  </div>
                  <p className="opacity-70">{`${to.subaccount.amount} ${getFtFromSub(to.subaccount.ft).symbol}`}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-start items-start w-full gap-3">
                <div className="flex flex-row justify-between items-center w-full opacity-70">
                  <p>Principal</p>
                  <p className="text-right">{shortAddress(to.principal, 12, 10)}</p>
                </div>
                <div className="flex flex-row justify-between items-center w-full border-b border-b-BorderColor/70 pb-3">
                  <p className="opacity-70">{t("virtual")}</p>
                  <p>{to.vIdx}</p>
                </div>
                {to.remote && (
                  <div className="flex flex-row justify-between items-center w-full">
                    <p>{to.remote.name}</p>
                    <GreenCheck />
                  </div>
                )}
                <p className="text-RemoteAmount/70">{remoteAmount}</p>
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
              sufix={
                <div className="flex flex-row justify-start items-center">
                  <p className="opacity-60">{getFtFromSub(from.subaccount?.ft || "0").symbol}</p>
                  <ExchangeIcon />
                </div>
              }
            />
          </div>
          <div className="w-full flex flex-col justify-between items-center mt-12 gap-4">
            <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
            <div className="flex flex-row justify-end items-center w-full gap-2">
              <CustomButton className="min-w-[5rem]" onClick={onBack} size={"small"}>
                <p>{t("back")}</p>
              </CustomButton>
              <CustomButton className="min-w-[5rem]" onClick={onSend} size={"small"}>
                {loading ? <LoadingLoader className="mt-1" /> : <p>{t("send")}</p>}
              </CustomButton>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );

  function onClose() {
    setDrawerOpen(false);
    setQRview("");
    setAmount("0");
  }

  function onNext() {
    const fromFtId = getAssetId(from);
    const toFtId = getAssetId(to);
    if (!validation(from)) setErrMsg("err.from");
    else if (!validation(to)) setErrMsg("err.to");
    else if (fromFtId === "" || toFtId === "" || fromFtId !== toFtId) setErrMsg("not.match.asset.id");
    else if (!errMsg) {
      setFtId(fromFtId);
      setDecimals(getFtFromSub(fromFtId).decimal);
      setSummary(true);
    }
  }

  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const amnt = e.target.value;
    if (validateAmount(amnt, decimals) || amnt === "") {
      setAmount(amnt);
    }
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

  function getAssetId(data: HplTxUser) {
    let id = "";
    if (data.subaccount) id = data.subaccount.ft;
    else if (data.remote) id = data.remote.ftIndex;
    else {
      // get id from  remoteAccountInfo
    }
    return id;
  }

  function onBack() {
    setErrMsg("");
    setFtId("0");
    setDecimals(0);
    setSummary(false);
  }

  async function onSend() {
    setLoading(true);
    let amnt = amount;
    if (amount.at(-1) === ".") amnt = amnt.slice(0, -1);
    else if (amount === "") amnt = "0";

    let txFrom: TransferAccountReference;
    if (from.subaccount)
      txFrom = {
        type: "sub",
        id: BigInt(from.subaccount.sub_account_id || "0"),
      };
    else txFrom = { type: "vir", owner: from.principal, id: BigInt(from.vIdx) };

    let txTo: TransferAccountReference;
    if (to.subaccount) txTo = { type: "sub", id: BigInt(to.subaccount.sub_account_id || "0") };
    else txTo = { type: "vir", owner: to.principal, id: BigInt(to.vIdx) };

    try {
      const aggregator = await hplClient.pickAggregator();
      const amountToSend = BigInt(amnt);
      if (aggregator) {
        console.log("tx: ", { txFrom: txFrom, txTo: txTo, ftId: BigInt(ftId), amountToSend: amountToSend });

        const { commit } = await hplClient.prepareSimpleTransfer(aggregator, txFrom, txTo, BigInt(ftId), amountToSend);
        const txId = await commit();
        console.log("TX id: ", txId);
        await lastValueFrom(
          hplClient.pollTx(aggregator, txId).pipe(
            map((x) => {
              console.log(x.status);
            }),
            catchError((err: any) => {
              console.log(err);
              return of(null);
            }),
          ),
        );
        await reloadHPLBallance();
        onClose();
      }
    } catch (e) {
      console.log("txErr: ", e);
    }

    setLoading(false);
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

  function validateAmount(amnt: string, dec: number): boolean {
    // Regular expression to match a valid number with at most 'dec' decimals
    const regex = new RegExp(`^[0-9]+([.,][0-9]{0,${dec}})?$`);

    // Check if amount is a valid number
    if (!regex.test(amnt)) {
      return false;
    }

    // Additional check for decimal places
    const decimalPart = amnt.split(/[.,]/)[1];
    if (decimalPart && decimalPart.length > dec) {
      return false;
    }

    return true;
  }
};

export default TransactionDrawer;
