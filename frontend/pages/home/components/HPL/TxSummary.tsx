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
import { useAppSelector } from "@redux/Store";
import { HplTransactionsEnum, SendingStatusEnum } from "@common/const";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { ActorSubclass } from "@dfinity/agent";
import { getHoleAmount, validateAmount } from "@common/utils/amount";
import { getDecimalAmount } from "@common/utils/number";
import logger from "@/common/utils/logger";
import {
  setAmountAction,
  setEndTxTime,
  setHplFtTx,
  setHplReceiverTx,
  setHplSenderTx,
  setInitTxTime,
  setSendingStatusAction,
} from "@redux/transaction/HplTransactionActions";
import DialogSendConfirmation from "./Modals/hplTransferStatusModal";

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
  const { feeConstant } = useAppSelector((state) => state.hpl);

  return (
    <Fragment>
      <div className="flex flex-col items-start justify-start w-full px-4 py-2 rounded bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70">
        <p className="mb-2 font-semibold ">{t("from")}</p>
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
      <div className="flex items-center justify-center w-full">
        <DownBlueArrow />
      </div>
      <div className="flex flex-col items-center justify-center w-full px-4 py-1 my-2 rounded bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70">
        <div className="flex flex-row items-center justify-start w-full gap-4">
          <p>{t("fee")}:</p>
          <p className="flex flex-row gap-2">
            {`${fee} `}
            <span className="opacity-60">{getFtFromSub(ftId || "0").symbol}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start w-full px-4 py-2 mt-3 rounded bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70">
        <p className="mb-2 font-semibold">{t("to")}</p>
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
      <div className="flex flex-row items-center justify-between w-full gap-4 mt-12">
        <p className="text-sm text-left text-TextErrorColor">{t(errMsg)}</p>
        <div className="flex flex-row items-center justify-end gap-2">
          <CustomButton className="min-w-[5rem]" onClick={onBack} size={"small"}>
            <p>{t("back")}</p>
          </CustomButton>
          <CustomButton className="min-w-[5rem]" onClick={onSend} size={"small"}>
            {loading ? <LoadingLoader className="mt-1" /> : <p>{t("submit")}</p>}
          </CustomButton>
        </div>
      </div>
      <DialogSendConfirmation modal={sendDialog} showConfirmationModal={onCloseTxDialog} />
    </Fragment>
  );
  function onAmountChange(e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) {
    const amnt = e.target.value;

    if (validateAmount(amnt, decimals) || amnt === "") {
      const holeAmount = getHoleAmount(amnt, getFtFromSub(ftId).decimal);
      if (
        (from?.subaccount && BigInt(holeAmount) <= BigInt(from.subaccount.amount)) ||
        (from.type === HplTransactionsEnum.Enum.VIRTUAL && BigInt(holeAmount) <= BigInt(rmtAmountFrom))
      ) {
        setAmount(amnt);
        if (amnt.trim() === "") {
          setFee("");
          setAmountReceiver("");
        } else {
          // const holeAmount = getHoleAmount(amnt, getFtFromSub(ftId).decimal);
          const newFee = Math.ceil(Number(holeAmount) / (feeConstant + 1));
          setFee(getDecimalAmount(newFee, getFtFromSub(ftId).decimal, true));
          setAmountReceiver(getDecimalAmount(Number(holeAmount) - newFee, getFtFromSub(ftId).decimal, true));
        }
        setErrMsg("");
      }
    }
  }

  function onAmountReceiverChange(e: ChangeEvent<HTMLInputElement>) {
    const amnt = e.target.value;
    if (validateAmount(amnt, decimals) || amnt === "") {
      const holeAmount = getHoleAmount(amnt, getFtFromSub(ftId).decimal);
      const newFee = Math.ceil(Number(holeAmount) / feeConstant);
      if (
        (from?.subaccount && BigInt(newFee + Number(holeAmount)) <= BigInt(from.subaccount.amount)) ||
        (from.type === HplTransactionsEnum.Enum.VIRTUAL && BigInt(newFee + Number(holeAmount)) <= BigInt(rmtAmountFrom))
      ) {
        setAmountReceiver(amnt);
        if (amnt.trim() === "") {
          setFee("");
          setAmount("");
        } else {
          setFee(getDecimalAmount(newFee, getFtFromSub(ftId).decimal, true));
          setAmount(getDecimalAmount(newFee + Number(holeAmount), getFtFromSub(ftId).decimal, true));
        }
        setErrMsg("");
      }
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
    try {
      const aggregator = await hplClient.pickAggregator();

      if (aggregator) {
        setErrMsg("");
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
                logger.debug(log);
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
      } else {
        setErrMsg("cound.not.pick.agreggator");
      }
    } catch (e) {
      logger.debug("txErr: ", e);
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
