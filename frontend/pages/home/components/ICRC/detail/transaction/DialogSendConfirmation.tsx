// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { ReactComponent as DownBlueArrow } from "@assets/svg/files/down-blue-arrow.svg";
import UpAmountIcon from "@assets/svg/files/up-amount-icon.svg";
import SendReceiveIcon from "@assets/svg/files/send_recaive_icon.svg";
//
import Modal from "@components/Modal";
import { CustomCopy } from "@components/CopyTooltip";
import { getDecimalAmount, shortAddress } from "@/utils";
import { ProtocolType, ProtocolTypeEnum, SendingStatusEnum } from "@/const";
import { useTranslation } from "react-i18next";
import useSend from "@pages/home/hooks/useSend";
import { resetSendStateAction } from "@redux/transaction/TransactionActions";
import { ValidationErrorsEnum } from "@/@types/transactions";
import { getElapsedSecond } from "@/utils/formatTime";
import AssetSymbol from "@components/AssetSymbol";

interface DialogSendConfirmationProps {
  setDrawerOpen(value: boolean): void;
  showConfirmationModal(value: boolean): void;
  modal: boolean;
  network: ProtocolType;
}

const DialogSendConfirmation = ({
  setDrawerOpen,
  showConfirmationModal,
  modal,
  network,
}: DialogSendConfirmationProps) => {
  const {
    receiverPrincipal,
    receiverSubAccount,
    amount,
    sender,
    sendingStatus,
    errors,
    initTime,
    endTime,
    hplSender,
    hplReceiver,
    hplFtTx,
  } = useSend();
  const { t } = useTranslation();

  return (
    <Modal
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
          {network === ProtocolTypeEnum.Enum.ICRC1 ? (
            <div className="flex items-center justify-center p-2 border rounded-md border-BorderColorTwoLight dark:border-BorderColorTwo">
              <img src={UpAmountIcon} alt="send-icon" />
            </div>
          ) : (
            <img src={SendReceiveIcon} alt="send-icon" />
          )}

          <p className="mt-3 text-lg font-semibold">{getStatusMessage(sendingStatus)}</p>
          {(network === ProtocolTypeEnum.Enum.ICRC1 && getError()) !== "" && (
            <p className="mt-1 text-md text-slate-color-error">{getError()}</p>
          )}
          <div className="flex flex-row items-start justify-center w-full gap-4 font-light opacity-80 text-sm mt-1">
            <p>
              {sendingStatus === SendingStatusEnum.enum.done || sendingStatus === SendingStatusEnum.enum.error
                ? `Processing took ${getElapsedSecond(initTime, endTime)} seconds`
                : ""}
            </p>
          </div>
        </div>

        {network === ProtocolTypeEnum.Enum.ICRC1 ? (
          <div className="flex flex-row items-start justify-start w-full gap-4 py-4 pl-8 font-light opacity-50 text-md">
            <div className="flex flex-col items-start justify-start gap-2">
              <p>{`${t("principal")}:`}</p>
              <p>{`${t("acc.subacc")}:`}</p>
              <p>{`${t("amount")}:`}</p>
            </div>
            <div className="flex flex-col items-start justify-start gap-2">
              <div className="flex flex-row items-center justify-start gap-2">
                <p>{shortAddress(receiverPrincipal || "", 12, 10)}</p>
                <CustomCopy size={"small"} copyText={receiverPrincipal} />
              </div>
              <div className="flex flex-row items-center justify-start gap-2">
                <p>{receiverSubAccount}</p>
                <CustomCopy size={"small"} copyText={receiverSubAccount} />
              </div>
              <p>
                {amount} {sender?.asset?.symbol || ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-around w-full gap-2 p-4 font-light opacity-50 text-md">
            <div className="flex flex-col justify-start items-start ">
              <p>
                {hplSender.subaccount
                  ? hplSender.subaccount.name
                  : hplSender.remote
                  ? hplSender.remote.name
                  : hplSender.code || ""}
              </p>
            </div>
            <div className="flex flex-col justify-center items-center">
              <DownBlueArrow className="w-6 h-6 -rotate-90" />
              <AssetSymbol
                ft={hplFtTx}
                sufix={
                  <p className="dark:opacity-60 dark:text-RemoteAmount text-AmountRemote ml-2 font-light">
                    {`${getDecimalAmount(amount || 0, hplFtTx.decimal)}`}
                  </p>
                }
              />
            </div>
            <div className="flex flex-col justify-start items-end ">
              <p>
                {hplReceiver.subaccount
                  ? hplReceiver.subaccount.name
                  : hplReceiver.remote
                  ? hplReceiver.remote.name
                  : hplReceiver.code || ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  function onClose() {
    setDrawerOpen(false);
    showConfirmationModal(false);
    resetSendStateAction();
  }

  function getStatusMessage(status: string) {
    switch (status) {
      case SendingStatusEnum.enum.sending:
        return t("sending");
      case SendingStatusEnum.enum.done:
        return t("sending.successful");
      case SendingStatusEnum.enum.error:
        return t("sending.failed");
      default:
        return "";
    }
  }

  function getError() {
    switch (true) {
      case errors?.includes(ValidationErrorsEnum.Values["error.allowance.subaccount.not.enough"]):
        return t(ValidationErrorsEnum.Values["error.allowance.subaccount.not.enough"]);
      default:
        return "";
    }
  }
};

export default DialogSendConfirmation;
