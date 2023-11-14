// svgs
import { getDecimalAmount, shortAddress } from "@/utils";
import { ReactComponent as GreenCheck } from "@assets/svg/files/green_check.svg";
//
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

interface TxAccountInfoProps {
  txUser: HplTxUser;
  getAssetLogo(id: string): string;
  getFtFromSub(sub: string): HPLAsset;
  ftId: string;
  rmtAmount: string;
}

const TxAccountInfo = ({ txUser, getAssetLogo, ftId, getFtFromSub, rmtAmount }: TxAccountInfoProps) => {
  const { t } = useTranslation();
  return (
    <Fragment>
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
        <div className="flex flex-col justify-start items-start w-full gap-3">
          <div className="flex flex-row justify-between items-center w-full opacity-70">
            <p>Principal</p>
            <p className="text-right">{shortAddress(txUser.principal, 12, 10)}</p>
          </div>
          <div className="flex flex-row justify-between items-center w-full border-b border-b-BorderColor/70 pb-3">
            <p className="opacity-70">{t("virtual")}</p>
            <p>{txUser.vIdx}</p>
          </div>
          {txUser.remote && (
            <div className="flex flex-row justify-between items-center w-full">
              <p>{txUser.remote.name}</p>
              <GreenCheck />
            </div>
          )}
          <p className="text-RemoteAmount font-semibold">{`${getDecimalAmount(rmtAmount, getFtFromSub(ftId).decimal)} ${
            getFtFromSub(ftId).symbol
          }`}</p>
        </div>
      )}
    </Fragment>
  );
};

export default TxAccountInfo;
