// svgs
import { ReactComponent as GreenCheck } from "@assets/svg/files/green_check.svg";
//
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDecimalAmount, shortAddress } from "@/utils";
import { CustomInput } from "@components/input";
import AssetSymbol from "@components/AssetSymbol";
import { HplTransactionsEnum } from "@/const";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";

interface TxAccountInfoProps {
  txUser: HplTxUser;
  getAssetLogo(id: string): string;
  getFtFromSub(sub: string): HPLAsset;
  ftId: string;
  rmtAmount: string;
  setRmtAmount(value: string): void;
  amnt: string;
  onAmountChange(e: ChangeEvent<HTMLInputElement>): void;
  onMaxAmount(): void;
  ingressActor: ActorSubclass<IngressActor>;
  sent?: boolean;
}

const TxAccountInfo = ({
  txUser,
  getAssetLogo,
  ftId,
  getFtFromSub,
  setRmtAmount,
  rmtAmount,
  amnt,
  onAmountChange,
  onMaxAmount,
  ingressActor,
  sent,
}: TxAccountInfoProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (txUser.type === HplTransactionsEnum.Enum.VIRTUAL) {
      getVirtualAmount(txUser, setRmtAmount);
    }
  }, [txUser]);

  const amountField = () => {
    return (
      <div className={`flex ${sent ? "flex-col my-2" : "flex-col-reverse mb-4"} justify-end items-start w-full gap-1`}>
        {
          <AssetSymbol
            ft={getFtFromSub(ftId)}
            textClass={`${
              txUser.subaccount ? "opacity-50" : "dark:text-RemoteAmount text-AmountRemote dark:opacity-60"
            } font-light`}
            sufix={
              txUser.subaccount ? (
                <p className="opacity-70 ml-2 font-light">{`${getDecimalAmount(
                  txUser.subaccount.amount,
                  getFtFromSub(ftId).decimal,
                )}`}</p>
              ) : (
                <p className="dark:opacity-60 dark:text-RemoteAmount text-AmountRemote ml-2 font-light">
                  {`${getDecimalAmount(rmtAmount, getFtFromSub(ftId).decimal)}`}
                </p>
              )
            }
          />
        }
        <CustomInput
          intent={"secondary"}
          value={amnt}
          onChange={onAmountChange}
          sizeInput="medium"
          border={"secondary"}
          autoFocus={sent}
          sufix={
            <div className="flex flex-row justify-start items-center gap-2  pr-6">
              {sent && (
                <button
                  className="flex justify-center items-center p-1 bg-RadioCheckColor rounded cursor-pointer"
                  onClick={onMaxAmount}
                >
                  <p className="text-sm text-PrimaryTextColor">{t("max")}</p>
                </button>
              )}
              <img src={getAssetLogo(ftId)} className="w-6 h-6" alt="info-icon" />
              <AssetSymbol ft={getFtFromSub(ftId)} outBoxClass="ml-2" textClass="opacity-60" />
            </div>
          }
        />
      </div>
    );
  };

  return (
    <div className={`flex ${sent ? "flex-col" : "flex-col-reverse"} justify-start items-start w-full`}>
      {txUser.subaccount ? (
        <div className="flex flex-row justify-start items-center w-full gap-5">
          <div className="flex flex-col justify-start items-start gap-1">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="flex justify-center items-center  px-1 bg-slate-500 rounded">
                <p className=" text-PrimaryTextColor">{txUser.subaccount.sub_account_id}</p>
              </div>
              <p className="text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor">
                {txUser.subaccount.name}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-start items-start w-full gap-0.5">
          <div className="flex flex-row justify-between items-center w-full opacity-70">
            <p>Principal</p>
            <p className="text-right">{shortAddress(txUser.principal, 12, 10)}</p>
          </div>
          <div className="flex flex-row justify-between items-center w-full pb-3 ">
            <p className="opacity-70">{t("virtual")}</p>
            <p>{txUser.remote ? txUser.remote.code : txUser.code || ""}</p>
          </div>
          {txUser.remote && (
            <div className="flex flex-row justify-between items-center w-full pt-3 border-t border-t-BorderColor/70">
              <p>{txUser.remote.name}</p>
              <GreenCheck />
            </div>
          )}
        </div>
      )}
      {amountField()}
    </div>
  );

  async function getVirtualAmount(rmt: HplTxUser, set: (val: string) => void) {
    try {
      const auxState = await ingressActor.state({
        ftSupplies: [],
        virtualAccounts: [],
        accounts: [],
        remoteAccounts: [{ id: [Principal.fromText(rmt.principal), BigInt(rmt.vIdx)] }],
      });
      console.log("amount", auxState.remoteAccounts[0][1][0].ft.toString());

      set(auxState.remoteAccounts[0][1][0].ft.toString() || "0");
    } catch (e) {
      set("0");
    }
  }
};

export default TxAccountInfo;
