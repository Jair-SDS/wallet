// svgs
import { ReactComponent as GreenCheck } from "@assets/svg/files/green_check.svg";
import { ReactComponent as ExchangeIcon } from "@assets/svg/files/arrows-exchange-v.svg";
//
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { getDecimalAmount, shortAddress } from "@/utils";
import { CustomInput } from "@components/Input";

interface TxAccountInfoProps {
  txUser: HplTxUser;
  getAssetLogo(id: string): string;
  getFtFromSub(sub: string): HPLAsset;
  ftId: string;
  rmtAmount: string;
  amnt: string;
  onAmountChange(e: ChangeEvent<HTMLInputElement>): void;
  ft: string;
  sent?: boolean;
}

const TxAccountInfo = ({
  txUser,
  getAssetLogo,
  ftId,
  getFtFromSub,
  rmtAmount,
  amnt,
  onAmountChange,
  ft,
  sent,
}: TxAccountInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col justify-start items-start w-full">
      {txUser.subaccount ? (
        <div className="flex flex-row justify-start items-center w-full gap-5">
          <img src={getAssetLogo(ftId)} className="w-8 h-8" alt="info-icon" />
          <div className="flex flex-col justify-start items-start gap-1">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="flex justify-center items-center  px-1 bg-slate-500 rounded">
                <p className=" text-PrimaryTextColor">{txUser.subaccount.sub_account_id}</p>
              </div>
              <p className="text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor">
                {txUser.subaccount.name}
              </p>
            </div>
            <p className="opacity-70">{`${getDecimalAmount(txUser.subaccount.amount, getFtFromSub(ftId).decimal)} ${
              getFtFromSub(ftId).symbol
            }`}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-start items-start w-full gap-0.5">
          <div className="flex flex-row justify-between items-center w-full opacity-70">
            <p>Principal</p>
            <p className="text-right">{shortAddress(txUser.principal, 12, 10)}</p>
          </div>
          <div className="flex flex-row justify-between items-center w-full border-b border-b-BorderColor/70 pb-3 mb-3">
            <p className="opacity-70">{t("virtual")}</p>
            <p>{txUser.vIdx}</p>
          </div>
          {txUser.remote && (
            <div className="flex flex-row justify-between items-center w-full">
              <p>{txUser.remote.name}</p>
              <GreenCheck />
            </div>
          )}
          <p className="dark:text-RemoteAmount dark:opacity-60 text-AmountRemote">{`${getDecimalAmount(
            rmtAmount,
            getFtFromSub(ftId).decimal,
          )} ${getFtFromSub(ftId).symbol}`}</p>
        </div>
      )}
      <div className="flex flex-row justify-end items-center w-full my-2 gap-2 border-t border-t-BorderColor/70 pt-2">
        <p className="text-sm">{t(sent ? "sent.amount" : "receive.amount")}</p>
        <CustomInput
          compOutClass="!w-1/2"
          inputClass="text-right"
          intent={"secondary"}
          value={amnt}
          onChange={onAmountChange}
          sizeInput="small"
          border={"secondary"}
          autoFocus={sent}
          sufix={
            <div className="flex flex-row justify-start items-center">
              <p className="opacity-60">{getFtFromSub(ft || "0").symbol}</p>
              <ExchangeIcon />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TxAccountInfo;
