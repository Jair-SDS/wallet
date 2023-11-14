// svgs
import { ReactComponent as DownBlueArrow } from "@assets/svg/files/down-blue-arrow.svg";
import { ReactComponent as ExchangeIcon } from "@assets/svg/files/arrows-exchange-v.svg";
//
import { ChangeEvent, Fragment, useState } from "react";
import TxAccountInfo from "./TxAccountInfo";
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import { CustomInput } from "@components/Input";
import { CustomButton } from "@components/Button";
import LoadingLoader from "@components/Loader";
import { HPLClient, TransferAccountReference, bigIntReplacer } from "@research-ag/hpl-client";
import { catchError, lastValueFrom, map, of } from "rxjs";
import { getHoleAmount, validateAmount } from "@/utils";

interface TxSummaryProps {
  from: HplTxUser;
  to: HplTxUser;
  getAssetLogo(id: string): string;
  getFtFromSub(sub: string): HPLAsset;
  ftId: string;
  rmtAmountFrom: string;
  rmtAmountTo: string;
  amount: string;
  decimals: number;
  setAmount(val: string): void;
  errMsg: string;
  setErrMsg(val: string): void;
  setFtId(val: string): void;
  setDecimals(val: number): void;
  setSummary(val: boolean): void;
  hplClient: HPLClient;
  onClose(): void;
  reloadHPLBallance(): void;
}

const TxSummary = ({
  from,
  to,
  getAssetLogo,
  getFtFromSub,
  ftId,
  rmtAmountFrom,
  rmtAmountTo,
  amount,
  decimals,
  setAmount,
  errMsg,
  setErrMsg,
  setFtId,
  setDecimals,
  setSummary,
  hplClient,
  onClose,
  reloadHPLBallance,
}: TxSummaryProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  return (
    <Fragment>
      <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 rounded">
        <p className="font-semibold mb-2 ">{t("from")}</p>
        <TxAccountInfo
          txUser={from}
          getAssetLogo={getAssetLogo}
          getFtFromSub={getFtFromSub}
          ftId={ftId}
          rmtAmount={rmtAmountFrom}
        />
      </div>
      <div className="flex flex-row justify-center items-center w-full mt-3">
        <DownBlueArrow />
      </div>
      <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 rounded mt-3">
        <p className="font-semibold mb-2">{t("to")}</p>
        <TxAccountInfo
          txUser={to}
          getAssetLogo={getAssetLogo}
          getFtFromSub={getFtFromSub}
          ftId={ftId}
          rmtAmount={rmtAmountTo}
        />
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
      <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
        <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
        <div className="flex flex-row justify-end items-center gap-2">
          <CustomButton className="min-w-[5rem]" onClick={onBack} size={"small"}>
            <p>{t("back")}</p>
          </CustomButton>
          <CustomButton className="min-w-[5rem]" onClick={onSend} size={"small"}>
            {loading ? <LoadingLoader className="mt-1" /> : <p>{t("send")}</p>}
          </CustomButton>
        </div>
      </div>
    </Fragment>
  );
  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const amnt = e.target.value;
    if (validateAmount(amnt, decimals) || amnt === "") {
      setAmount(amnt);
      setErrMsg("");
    }
  }

  function onBack() {
    setErrMsg("");
    setFtId("0");
    setDecimals(0);
    setSummary(false);
  }
  async function onSend() {
    setLoading(true);
    const amnt = getHoleAmount(amount, getFtFromSub(ftId).decimal);
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
          await reloadHPLBallance();
          onClose();
          onBack();
        }
      }
    } catch (e) {
      console.log("txErr: ", e);
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
};

export default TxSummary;
