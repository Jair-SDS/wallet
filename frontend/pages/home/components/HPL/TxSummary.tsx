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
import { HPLClient, TransferAccountReference } from "@research-ag/hpl-client";

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
      <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColor/70 dark:text-PrimaryTextColor/70 rounded">
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
      <div className="flex flex-col justify-start items-start w-full p-4 bg-ThemeColorBackLight dark:bg-ThemeColorBack text-PrimaryTextColor/70 dark:text-PrimaryTextColor/70 rounded mt-3">
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
  );
  function onAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const amnt = e.target.value;
    if (validateAmount(amnt, decimals) || amnt === "") {
      setAmount(amnt);
    }
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
        await hplClient.prepareSimpleTransfer(aggregator, txFrom, txTo, BigInt(ftId), amountToSend);
        await reloadHPLBallance();
        onClose();
      }
    } catch (e) {
      console.log("txErr: ", e);
    }

    setLoading(false);
  }
};

export default TxSummary;
