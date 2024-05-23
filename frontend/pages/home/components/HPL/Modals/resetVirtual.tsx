import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { CustomButton } from "@components/button";
import { LoadingLoader } from "@components/loader";
import { HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import { useHPL } from "@pages/hooks/hplHook";
import logger from "@/common/utils/logger";

interface ResetVirtualModalProps {
  selectVt: HPLVirtualSubAcc | undefined;
  loading: boolean;
  errMsg: string;
  setSelVt(value: HPLVirtualSubAcc | undefined): void;
  setLoading(value: boolean): void;
  setResetModal(value: boolean): void;
  setErrMsg(value: string): void;
}

const ResetVirtualModal = ({
  selectVt,
  loading,
  errMsg,
  setSelVt,
  setLoading,
  setResetModal,
  setErrMsg,
}: ResetVirtualModalProps) => {
  const { t } = useTranslation();
  const { ingressActor, reloadHPLBallance } = useHPL(false);
  return (
    <div className="flex flex-col items-start justify-start w-full gap-4 text-md">
      <div className="flex flex-row items-center justify-between w-full">
        <WarningIcon className="w-6 h-6" />
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setResetModal(false);
          }}
        />
      </div>
      <p className="w-full text-justify ">{t("reset.virtual.1")}</p>
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <p className="text-sm text-TextErrorColor">{errMsg}</p>
        <CustomButton className="min-w-[5rem]" onClick={onConfirmReset} size={"small"}>
          {loading ? <LoadingLoader className="mt-1" /> : <p>{t("yes")}</p>}
        </CustomButton>
      </div>
    </div>
  );

  async function onConfirmReset() {
    setLoading(true);
    if (selectVt) {
      try {
        await ingressActor.updateVirtualAccounts([
          [
            BigInt(selectVt.virt_sub_acc_id),
            {
              backingAccount: [BigInt(selectVt.backing)],
              state: [{ ft_set: BigInt(0) }],
              expiration: [BigInt(selectVt.expiration * 1000000)],
            },
          ],
        ]);
        await reloadHPLBallance(true);
        setResetModal(false);
        setSelVt(undefined);
      } catch (error) {
        logger.debug(error);
        setErrMsg("err.back");
      }
    }
    setLoading(false);
  }
};

export default ResetVirtualModal;
