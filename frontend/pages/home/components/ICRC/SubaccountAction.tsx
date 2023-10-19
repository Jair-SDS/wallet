// svgs
import ArrowBottomLeftIcon from "@assets/svg/files/arrow-bottom-left-icon.svg";
import ArrowTopRightIcon from "@assets/svg/files/arrow-top-right-icon.svg";
// import WrapIcon from "@assets/svg/files/wrap-icon.svg";
//
import { DrawerOption, DrawerOptionEnum, IconTypeEnum } from "@/const";
import { toFullDecimal } from "@/utils";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
interface ICRCSubaccountActionProps {
  setDrawerOption(value: DrawerOption): void;
  setDrawerOpen(value: boolean): void;
}

const ICRCSubaccountAction = ({ setDrawerOption, setDrawerOpen }: ICRCSubaccountActionProps) => {
  const { getAssetIcon, selectedAsset, selectedAccount } = GeneralHook();
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className="flex flex-col justify-center items-start bg-SelectRowColor w-[17rem] h-full rounded-l-md p-4 text-[#ffff]">
        <div className="flex flex-row justify-between items-center gap-1 w-full">
          {getAssetIcon(IconTypeEnum.Enum.HEADER, selectedAsset?.tokenSymbol, selectedAsset?.logo)}
          <div className="flex flex-col justify-center items-end">
            <p className="font-semibold text-[1.15rem] text-right">{`${toFullDecimal(
              selectedAccount?.amount || "0",
              selectedAccount?.decimal || "8",
            )} ${selectedAsset?.symbol}`}</p>
            <p className="font-semibold text-md">{`$${selectedAccount?.currency_amount}`}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-around items-center h-full w-[calc(100%-17rem)] text-ThirdTextColorLight dark:text-ThirdTextColor">
        <div className="flex flex-col justify-center items-center w-1/3 gap-1">
          <div
            className="flex flex-row justify-center items-center w-7 h-7 bg-SelectRowColor rounded-md cursor-pointer"
            onClick={() => {
              setDrawer(DrawerOptionEnum.Enum.SEND);
            }}
          >
            <img src={ArrowTopRightIcon} className="w-3 h-3" alt="send-icon" />
          </div>
          <p className="text-md">{t("send")}</p>
        </div>
        <div className="flex flex-col justify-center items-center w-1/3 gap-1">
          <div
            className="flex flex-row justify-center items-center w-7 h-7 bg-SelectRowColor rounded-md cursor-pointer"
            onClick={() => {
              setDrawer(DrawerOptionEnum.Enum.RECEIVE);
            }}
          >
            <img src={ArrowBottomLeftIcon} className="w-3 h-3" alt="receive-icon" />
          </div>
          <p className="text-md">{t("receive")}</p>
        </div>
        {/* <div className="flex flex-col justify-center items-center w-1/3 gap-1">
          <div
            className="flex flex-row justify-center items-center w-7 h-7 bg-SelectRowColor rounded-md cursor-pointer"
            onClick={() => {
              setDrawer(DrawerOptionEnum.Enum.WRAP);
            }}
          >
            <img src={WrapIcon} className="w-4 h-4" alt="wrap-icon" />
          </div>
          <p className="text-md">{t("wrap")}</p>
        </div> */}
      </div>
    </Fragment>
  );

  function setDrawer(drawer: DrawerOption) {
    setDrawerOption(drawer);
    setTimeout(() => {
      setDrawerOpen(true);
    }, 150);
  }
};

export default ICRCSubaccountAction;
