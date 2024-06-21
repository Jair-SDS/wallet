// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { ReactComponent as DownBlueArrow } from "@assets/svg/files/down-blue-arrow.svg";
import SendReceiveIcon from "@assets/svg/files/send_recaive_icon.svg";
//
import { SendingStatusEnum } from "@/common/const";
import { setTransactionDrawerAction } from "@redux/transaction/TransactionActions";
import { TransactionDrawer } from "@/@types/transactions";
import { getElapsedSecond } from "@/common/utils/datetimeFormaters";
import AssetSymbol from "@components/AssetSymbol";
import { getDecimalAmount } from "@common/utils/number";
import { BasicModal } from "@components/modal";

import { useTranslation } from "react-i18next";
import useHplTransaction from "@pages/home/hooks/useHplTransaction";
import { resetSendStateAction } from "@redux/transaction/HplTransactionActions";

interface DialogSendConfirmationProps {
  showConfirmationModal(value: boolean): void;
  modal: boolean;
}
const DialogSendConfirmation = ({ showConfirmationModal, modal }: DialogSendConfirmationProps) => {
  const { amount, sendingStatus, initTime, endTime, hplSender, hplReceiver, hplFtTx } = useHplTransaction();
  const { t } = useTranslation();

  return (
    <BasicModal
      open={modal}
      width="w-[22rem]"
      padding="py-3 px-1"
      border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
    >
      <div className="flex flex-col items-center justify-start w-full reative">
        <CloseIcon
          className="absolute cursor-pointer top-5 right-5 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={onClose}
        />
        <div className="flex flex-col items-center justify-start w-full py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
          <img src={SendReceiveIcon} alt="send-icon" />
          <p className="mt-3 text-lg font-semibold">{getStatusMessage(sendingStatus)}</p>

          <div className="flex flex-row items-start justify-center w-full gap-4 mt-1 text-sm font-light opacity-80">
            <p>
              {sendingStatus === SendingStatusEnum.enum.done ||
              sendingStatus === SendingStatusEnum.enum.error ||
              sendingStatus === SendingStatusEnum.enum.notEnough
                ? `Processing took ${getElapsedSecond(initTime, endTime)} seconds`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-around w-full gap-2 p-4 font-light opacity-50 text-md">
          <div className="flex flex-col items-start justify-start ">
            <p>
              {hplSender.subaccount
                ? hplSender.subaccount.name
                : hplSender.remote
                ? hplSender.remote.name
                : hplSender.code || ""}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <DownBlueArrow className="w-6 h-6 -rotate-90" />
            <AssetSymbol
              ft={hplFtTx}
              sufix={
                <p className="ml-2 font-light dark:opacity-60 dark:text-RemoteAmount text-AmountRemote">
                  {`${getDecimalAmount(amount || 0, hplFtTx.decimal)}`}
                </p>
              }
            />
          </div>
          <div className="flex flex-col items-end justify-start ">
            <p>
              {hplReceiver.subaccount
                ? hplReceiver.subaccount.name
                : hplReceiver.remote
                ? hplReceiver.remote.name
                : hplReceiver.code || ""}
            </p>
          </div>
        </div>
      </div>
    </BasicModal>
  );

  function onClose() {
    setTransactionDrawerAction(TransactionDrawer.NONE);
    showConfirmationModal(false);
    resetSendStateAction();
  }

  function getStatusMessage(status: string) {
    switch (status) {
      case SendingStatusEnum.enum.sending:
        return t("sending");
      case SendingStatusEnum.enum.done:
        return t("transfer.successful");
      case SendingStatusEnum.enum.error:
        return t("sending.failed");
      case SendingStatusEnum.enum.notEnough:
        return t("insufficient.funds");
      default:
        return "";
    }
  }
};

export default DialogSendConfirmation;
