// svgs
import ArrowBottomLeftIcon from "@assets/svg/files/arrow-bottom-left-icon.svg";
import ArrowTopRightIcon from "@assets/svg/files/arrow-top-right-icon.svg";
import QRIcon from "@assets/svg/files/qr-white.svg";
//
import { DrawerOption, DrawerOptionEnum } from "@/const";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHPL } from "@pages/hooks/hplHook";
import { toFullDecimal } from "@/utils";

interface HPLSubaccountActionProps {
  onActionClick(value: DrawerOption): void;
  enableReceiveAction: boolean;
}

const HPLSubaccountAction = ({ enableReceiveAction, onActionClick }: HPLSubaccountActionProps) => {
  const { getAssetLogo, selectSub, getFtFromSub } = useHPL(false);
  const { t } = useTranslation();

  return (
    <Fragment>
      <div className="flex flex-col justify-center items-start bg-SelectRowColor w-[17rem] h-full rounded-l-md p-4 text-[#ffff]">
        {selectSub ? (
          <div className="flex flex-row justify-start items-center gap-3 w-full">
            <img src={getAssetLogo(selectSub.ft)} className="w-8 h-8" alt="info-icon" />
            <p className="font-semibold text-2x1">{`${toFullDecimal(
              selectSub.amount,
              getFtFromSub(selectSub.ft).decimal,
              8,
            )} ${getFtFromSub(selectSub.ft).symbol}`}</p>
          </div>
        ) : (
          <p className="font-semibold text-lg">-</p>
        )}
      </div>
      <div className="flex flex-row justify-around items-center h-full w-[calc(100%-17rem)] text-ThirdTextColorLight dark:text-ThirdTextColor">
        <div className="flex flex-col justify-center items-center w-1/3 gap-1">
          <div
            className="flex flex-row justify-center items-center w-7 h-7 bg-SelectRowColor rounded-md cursor-pointer"
            onClick={() => onActionClick(DrawerOptionEnum.Enum.SEND)}
          >
            <img src={ArrowTopRightIcon} className="w-3 h-3" alt="send-icon" />
          </div>
          <p className="text-md">{t("send")}</p>
        </div>
        <div className="flex flex-col justify-center items-center w-1/3 gap-1">
          <div
            className="flex flex-row justify-center items-center w-7 h-7 bg-SelectRowColor rounded-md cursor-pointer"
            onClick={() => onActionClick(DrawerOptionEnum.Enum.RECEIVE)}
          >
            <img src={ArrowBottomLeftIcon} className="w-3 h-3" alt="receive-icon" />
          </div>
          <p className="text-md">{t("pull")}</p>
        </div>
        <div
          className={`flex flex-col justify-center items-center w-1/3 gap-1 ${
            enableReceiveAction ? "" : "opacity-[35%]"
          }`}
        >
          <div
            className={`flex flex-row justify-center items-center w-7 h-7 bg-SelectRowColor rounded-md ${
              enableReceiveAction ? "cursor-pointer" : "cursor-not-allowed pointer-events-none"
            }`}
            onClick={() => onActionClick(DrawerOptionEnum.Enum.HPL_QR)}
          >
            <img src={QRIcon} className="w-full h-full px-1" alt="receive-icon" />
          </div>
          <p className="text-md">{t("receive")}</p>
        </div>
      </div>
    </Fragment>
  );
};

export default HPLSubaccountAction;
