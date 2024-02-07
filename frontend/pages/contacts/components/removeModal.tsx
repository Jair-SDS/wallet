// svgs
import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import Modal from "@components/Modal";
import { CustomButton } from "@components/Button";
import { useTranslation } from "react-i18next";
import { DeleteContactTypeEnum } from "@/const";
import useContactTable from "../hooks/useContactTable";
import { useHplContacts } from "../hooks/hplContactsHook";

interface RemoveModalProps {
  deleteModal: boolean;
  setDeleteModal(value: boolean): void;
  deleteType: DeleteContactTypeEnum;
  deleteHpl: boolean;
  getDeleteMsg(): { msg1: string; msg2: string };
  deleteObject: {
    principal: string;
    name: string;
    tokenSymbol: string;
    symbol: string;
    subaccIdx: string;
    subaccName: string;
    totalAssets: number;
    TotalSub: number;
  };
}

const RemoveModal = ({
  deleteModal,
  setDeleteModal,
  deleteType,
  deleteHpl,
  getDeleteMsg,
  deleteObject,
}: RemoveModalProps) => {
  const { t } = useTranslation();
  const { removeCntct, removeAsset, removeSubacc } = useContactTable();
  const { removeHplCntct, removeHplCntctRemote } = useHplContacts();

  return (
    <Modal
      open={deleteModal}
      width="w-[18rem]"
      padding="py-5"
      border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
    >
      <div className="flex flex-col items-start justify-start w-full gap-4 text-md">
        <div className="flex flex-row items-center justify-between w-full px-8">
          <WarningIcon className="w-6 h-6" />
          <CloseIcon
            className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
            onClick={() => {
              setDeleteModal(false);
            }}
          />
        </div>
        <div className="flex flex-col items-start justify-start w-full px-8">
          <p className="font-light text-left">
            {getDeleteMsg().msg1}
            <span className="ml-1 font-semibold break-all">{getDeleteMsg().msg2}</span>?
          </p>
        </div>
        {(deleteType === DeleteContactTypeEnum.Enum.CONTACT || deleteType === DeleteContactTypeEnum.Enum.ASSET) && (
          <div className="flex flex-row justify-start items-start w-full px-8 py-3 bg-SecondaryColorLight dark:bg-SecondaryColor gap-1">
            <div className="flex flex-col justify-start items-start">
              {deleteType === DeleteContactTypeEnum.Enum.CONTACT && (
                <p>{t(deleteHpl ? "total.remotes" : "total.assets")}</p>
              )}
              {!deleteHpl && <p>{t("total.subacc")}</p>}
            </div>
            <div className="flex flex-col items-start justify-start">
              {deleteType === DeleteContactTypeEnum.Enum.CONTACT && (
                <p className="font-semibold">{deleteObject.totalAssets}</p>
              )}
              {!deleteHpl && <p className="font-semibold">{deleteObject.TotalSub}</p>}
            </div>
          </div>
        )}
        <div className="flex flex-row items-center justify-end w-full px-8">
          <CustomButton className="min-w-[5rem]" onClick={handleConfirmButton} size={"small"}>
            <p>{t("confirm")}</p>
          </CustomButton>
        </div>
      </div>
    </Modal>
  );

  function handleConfirmButton() {
    if (deleteHpl) {
      switch (deleteType) {
        case DeleteContactTypeEnum.Enum.CONTACT:
          removeHplCntct(deleteObject.principal);
          break;
        case DeleteContactTypeEnum.Enum.SUB:
          removeHplCntctRemote(deleteObject.principal, deleteObject.subaccIdx);
          break;
      }
    } else {
      switch (deleteType) {
        case DeleteContactTypeEnum.Enum.CONTACT:
          removeCntct(deleteObject.principal);
          break;
        case DeleteContactTypeEnum.Enum.ASSET:
          removeAsset(deleteObject.principal, deleteObject.tokenSymbol);
          break;
        case DeleteContactTypeEnum.Enum.SUB:
          removeSubacc(deleteObject.principal, deleteObject.tokenSymbol, deleteObject.subaccIdx);
          break;
        default:
          break;
      }
    }
    setDeleteModal(false);
  }
};

export default RemoveModal;
