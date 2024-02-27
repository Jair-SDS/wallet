import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { CustomButton } from "@components/Button";
import LoadingLoader from "@components/Loader";
import { HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import { useHPL } from "@pages/hooks/hplHook";

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
    <div className="flex flex-col justify-start items-start w-full gap-4 text-md">
      <div className="flex flex-row justify-between items-center w-full">
        <WarningIcon className="w-6 h-6" />
        <CloseIcon
          className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
          onClick={() => {
            setResetModal(false);
          }}
        />
      </div>
      <p className=" text-justify w-full">{t("reset.virtual.1")}</p>
      <div className="w-full flex flex-row justify-between items-center gap-2">
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
        await ingressActor.updateVirtualAccount(BigInt(selectVt.virt_sub_acc_id), {
          backingAccount: [BigInt(selectVt.backing)],
          state: [{ ft_set: BigInt(0) }],
          expiration: [BigInt(selectVt.expiration * 1000000)],
        });
        await reloadHPLBallance(true);
        setResetModal(false);
        setSelVt(undefined);
      } catch {
        setErrMsg("err.back");
      }
    }
    setLoading(false);
  }
};

export default ResetVirtualModal;
