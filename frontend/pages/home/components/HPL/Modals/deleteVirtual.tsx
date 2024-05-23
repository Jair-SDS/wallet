import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { CustomButton } from "@components/button";
import { LoadingLoader } from "@components/loader";
import { HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import { useHPL } from "@pages/hooks/hplHook";
import { db } from "@/database/db";
import logger from "@/common/utils/logger";

interface DeleteVirtualModalProps {
  selectVt: HPLVirtualSubAcc | undefined;
  loading: boolean;
  errMsg: string;
  setSelVt(value: HPLVirtualSubAcc | undefined): void;
  setLoading(value: boolean): void;
  setDeleteModal(value: boolean): void;
  setErrMsg(value: string): void;
}

const DeleteVirtualModal = ({
  selectVt,
  loading,
  errMsg,
  setSelVt,
  setLoading,
  setDeleteModal,
  setErrMsg,
}: DeleteVirtualModalProps) => {
  const { t } = useTranslation();
  const { ingressActor, hplVTsData, reloadHPLBallance } = useHPL(false);
  return (
    <div className="flex flex-col items-start justify-start w-full gap-4 text-md">
      <div className="flex flex-row items-center justify-between w-full">
        <WarningIcon className="w-6 h-6" />
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setDeleteModal(false);
          }}
        />
      </div>
      <p className="w-full text-justify ">
        {t("delete.virtual.1")}{" "}
        <span className="font-semibold">
          {selectVt?.name != "" ? selectVt?.name : `[ ${selectVt?.virt_sub_acc_id || "0"} ]`}?
        </span>{" "}
        {t("delete.virtual.2")}
      </p>
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <p className="text-sm text-TextErrorColor">{errMsg}</p>
        <CustomButton className="min-w-[5rem]" onClick={onConfirmDelete} size={"small"}>
          {loading ? <LoadingLoader className="mt-1" /> : <p>{t("yes")}</p>}
        </CustomButton>
      </div>
    </div>
  );

  async function onConfirmDelete() {
    setLoading(true);
    if (selectVt) {
      try {
        await ingressActor.deleteVirtualAccounts([BigInt(selectVt.virt_sub_acc_id)]);
        const auxVts = hplVTsData.filter((vt) => vt.id != selectVt.virt_sub_acc_id);
        await db().updateHplVirtualsByLedger(auxVts);
        await reloadHPLBallance(true);
        setDeleteModal(false);
        setSelVt(undefined);
      } catch (error) {
        logger.debug(error);
        setErrMsg("err.back");
      }
    }
    setLoading(false);
  }
};

export default DeleteVirtualModal;
