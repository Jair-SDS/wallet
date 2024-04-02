// svgs
import { ReactComponent as DownBlueArrow } from "@assets/svg/files/down-blue-arrow.svg";
//
import { ChangeEvent, Fragment, useState } from "react";
import TxAccountInfo from "./TxAccountInfo";
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/button";
import { LoadingLoader } from "@components/loader";
import { HPLClient, TransferAccountReference, bigIntReplacer } from "@research-ag/hpl-client";
import { catchError, lastValueFrom, map, of } from "rxjs";
import { getDecimalAmount, getHoleAmount, validateAmount } from "@/utils";
import { useAppSelector } from "@redux/Store";
import DialogSendConfirmation from "../ICRC/detail/transaction/DialogSendConfirmation";
import { ProtocolTypeEnum, SendingStatusEnum } from "@/const";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import {
  setAmountAction,
  setEndTxTime,
  setHplFtTx,
  setHplReceiverTx,
  setHplSenderTx,
  setInitTxTime,
  setSendingStatusAction,
} from "@redux/transaction/TransactionActions";
import { ActorSubclass } from "@dfinity/agent";

interface TxSummaryProps {
  from: HplTxUser;
  to: HplTxUser;
  getAssetLogo(id: string): string;
  getFtFromSub(sub: string): HPLAsset;
  ftId: string;
  rmtAmountFrom: string;
  setRmtAmountFrom(value: string): void;
  rmtAmountTo: string;
  setRmtAmountTo(value: string): void;
  amount: string;
  decimals: number;
  setAmount(val: string): void;
  amountReceiver: string;
  setAmountReceiver(val: string): void;
  errMsg: string;
  setErrMsg(val: string): void;
  setFtId(val: string): void;
  setDecimals(val: number): void;
  setSummary(val: boolean): void;
  hplClient: HPLClient;
  onClose(): void;
  reloadHPLBallance(): void;
  setDrawerOpen(val: boolean): void;
  ingressActor: ActorSubclass<IngressActor>;
}

const TxSummary = ({
  from,
  to,
  getAssetLogo,
  getFtFromSub,
  ftId,
  rmtAmountFrom,
  rmtAmountTo,
  setRmtAmountFrom,
  setRmtAmountTo,
  amount,
  decimals,
  setAmount,
  amountReceiver,
  setAmountReceiver,
  errMsg,
  setErrMsg,
  setFtId,
  setDecimals,
  setSummary,
  hplClient,
  onClose,
  reloadHPLBallance,
  ingressActor,
}: TxSummaryProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState("0");
  const [sendDialog, showSendDialog] = useState(false);
  const { feeConstant } = useAppSelector((state) => state.asset);

  return (
    <Fragment>
      <div className="flex flex-col justify-start items-start w-full px-4 py-2 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 rounded">
        <p className="font-semibold mb-2 ">{t("from")}</p>
        <TxAccountInfo
          txUser={from}
          getAssetLogo={getAssetLogo}
          getFtFromSub={getFtFromSub}
          ftId={ftId}
          rmtAmount={rmtAmountFrom}
          amnt={amount}
          onAmountChange={onAmountChange}
          sent={true}
          onMaxAmount={onMaxAmount}
          setRmtAmount={setRmtAmountFrom}
          ingressActor={ingressActor}
        />
      </div>
      <div className="flex justify-center items-center w-full">
        <DownBlueArrow />
      </div>
      <div className="flex flex-col justify-center items-center w-full my-2 px-4 py-1 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 rounded">
        <div className="flex flex-row justify-start items-center w-full gap-4">
          <p>{t("fee")}:</p>
          <p className="flex flex-row gap-2">
            {`${fee} `}
            <span className="opacity-60">{getFtFromSub(ftId || "0").symbol}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-start items-start w-full px-4 py-2 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 rounded mt-3">
        <p className="font-semibold mb-2">{t("to")}</p>
        <TxAccountInfo
          txUser={to}
          getAssetLogo={getAssetLogo}
          getFtFromSub={getFtFromSub}
          ftId={ftId}
          rmtAmount={rmtAmountTo}
          amnt={amountReceiver}
          onAmountChange={onAmountReceiverChange}
          onMaxAmount={onMaxAmount}
          setRmtAmount={setRmtAmountTo}
          ingressActor={ingressActor}
        />
      </div>
      <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
        <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
        <div className="flex flex-row justify-end items-center gap-2">
          <CustomButton className="min-w-[5rem]" onClick={onBack} size={"small"}>
            <p>{t("back")}</p>
          </CustomButton>
          <CustomButton className="min-w-[5rem]" onClick={onSend} size={"small"}>
            {loading ? <LoadingLoader className="mt-1" /> : <p>{t("submit")}</p>}
          </CustomButton>
        </div>
      </div>
      <DialogSendConfirmation
        modal={sendDialog}
        showConfirmationModal={onCloseTxDialog}
        network={ProtocolTypeEnum.Enum.HPL}
      />
    </Fragment>
  );
  function onAmountChange(e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) {
    const amnt = e.target.value;
    if (validateAmount(amnt, decimals) || amnt === "") {
      setAmount(amnt);
      if (amnt.trim() === "") {
        setFee("");
        setAmountReceiver("");
      } else {
        const holeAmount = getHoleAmount(amnt, getFtFromSub(ftId).decimal);
        const newFee = Math.ceil(Number(holeAmount) / (feeConstant + 1));
        setFee(getDecimalAmount(newFee, getFtFromSub(ftId).decimal, true));
        setAmountReceiver(getDecimalAmount(Number(holeAmount) - newFee, getFtFromSub(ftId).decimal, true));
      }
      setErrMsg("");
    }
  }

  function onAmountReceiverChange(e: ChangeEvent<HTMLInputElement>) {
    const amnt = e.target.value;
    if (validateAmount(amnt, decimals) || amnt === "") {
      setAmountReceiver(amnt);
      if (amnt.trim() === "") {
        setFee("");
        setAmount("");
      } else {
        const holeAmount = getHoleAmount(amnt, getFtFromSub(ftId).decimal);
        const newFee = Math.ceil(Number(holeAmount) / feeConstant);
        setFee(getDecimalAmount(newFee, getFtFromSub(ftId).decimal, true));
        setAmount(getDecimalAmount(newFee + Number(holeAmount), getFtFromSub(ftId).decimal, true));
      }
      setErrMsg("");
    }
  }

  function onMaxAmount() {
    let maxAmount = "0";
    if (from.subaccount) {
      maxAmount = from.subaccount.amount;
    } else {
      maxAmount = rmtAmountFrom;
    }
    onAmountChange({ target: { value: getDecimalAmount(maxAmount, getFtFromSub(ftId).decimal, true) } });
  }

  function onBack() {
    setErrMsg("");
    setFtId("0");
    setDecimals(0);
    setSummary(false);
  }
  async function onSend() {
    const amnt = getHoleAmount(amountReceiver, getFtFromSub(ftId).decimal);
    const amountToSend = BigInt(amnt);
    setHplSenderTx(from);
    setHplReceiverTx(to);
    setHplFtTx(getFtFromSub(ftId || "0"));
    setAmountAction(amnt.toString());
    setLoading(true);
    showSendDialog(true);
    setSendingStatusAction(SendingStatusEnum.Enum.sending);
    setInitTxTime(new Date());
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
      if (aggregator) {
        const res = await hplClient.simpleTransfer(aggregator, txFrom, txTo, BigInt(ftId), amountToSend);
        let validTx = false;
        // poll tx
        await lastValueFrom(
          hplClient.pollTx(aggregator, res).pipe(
            map((x) => {
              if (x.status === "processed") {
                if (x.statusPayload[0].failure) {
                  setErrMsg(getTxErrMsg(JSON.stringify(x.statusPayload, bigIntReplacer)));
                } else if (x.statusPayload[0].success) {
                  setErrMsg("");
                  validTx = true;
                }
              }
            }),
            catchError((e: any) => {
              handleError(e, (log: string) => {
                console.log(log);
              });
              return of(null);
            }),
          ),
        );
        if (validTx) {
          setEndTxTime(new Date());
          setSendingStatusAction(SendingStatusEnum.Enum.done);
          reloadHPLBallance();
        } else {
          setEndTxTime(new Date());
          setSendingStatusAction(SendingStatusEnum.Enum.error);
        }
      }
    } catch (e) {
      console.log("txErr: ", e);
      setEndTxTime(new Date());
      setSendingStatusAction(SendingStatusEnum.Enum.error);
    }

    setLoading(false);
  }

  function handleError(e: any, logCallback: (log: string) => void) {
    const errorMessage = e.errorKey !== undefined ? `Error: ${e.toString()}` : "Error: " + e.message;
    logCallback(errorMessage);
  }

  function getTxErrMsg(msg: string) {
    let err = "";
    if (msg.includes("InsufficientFunds")) err = "insufficient.funds";
    return err;
  }

  function onCloseTxDialog(val: boolean) {
    if (!val) {
      showSendDialog(false);
      onBack();
      onClose();
    }
  }
};

export default TxSummary;
