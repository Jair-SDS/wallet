// svgs
import ArrowBottomLeftIcon from "@assets/svg/files/arrow-bottom-left-icon.svg";
import ArrowTopRightIcon from "@assets/svg/files/arrow-top-right-icon.svg";
//
import { DrawerOption, DrawerOptionEnum } from "@/const";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHPL } from "@pages/hooks/hplHook";
import { toFullDecimal } from "@/utils";
interface HPLSubaccountActionProps {
  setDrawerOption(value: DrawerOption): void;
  setDrawerOpen(value: boolean): void;
}

const HPLSubaccountAction = ({ setDrawerOption, setDrawerOpen }: HPLSubaccountActionProps) => {
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

export default HPLSubaccountAction;
