// svgs
import PlusIcon from "@assets/svg/files/plus-icon.svg";
//
import { SubaccountInfoEnum } from "@common/const";
import { CustomButton } from "@components/button";
import { useHPL } from "@pages/hooks/hplHook";
import { useTranslation } from "react-i18next";
import { PropsWithChildren } from "react";

interface SubaccountInfoProps extends PropsWithChildren {
  onAddVirtualAccount: () => void;
}

const SubaccountInfo = ({ children, onAddVirtualAccount }: SubaccountInfoProps) => {
  const { t } = useTranslation();
  const { selectSub, subInfoType, setSubInfoType } = useHPL(false);

  const selectedButton = "border-AccpetButtonColor border-b-2";
  const unselectedButton = "text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-60 !font-light";
  return selectSub ? (
    <div className="flex flex-col justify-start items-start w-full mt-2">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <div className="flex flex-row justify-start items-center gap-10  mb-4">
          <CustomButton
            intent={"noBG"}
            border={"underline"}
            className={`${subInfoType === SubaccountInfoEnum.Enum.VIRTUALS ? selectedButton : unselectedButton}`}
            onClick={() => {
              setSubInfoType(SubaccountInfoEnum.Enum.VIRTUALS);
            }}
          >
            <p>{t("virtuals")}</p>
          </CustomButton>
          <CustomButton
            intent={"noBG"}
            border={"underline"}
            className={`${subInfoType === SubaccountInfoEnum.Enum.TRANSACTIONS ? selectedButton : unselectedButton}`}
            onClick={() => {
              setSubInfoType(SubaccountInfoEnum.Enum.TRANSACTIONS);
            }}
          >
            <p>{t("transactions")}</p>
          </CustomButton>
        </div>
        {subInfoType === SubaccountInfoEnum.Enum.VIRTUALS && (
          <div className="flex flex-row justify-start items-center gap-5">
            <p className="text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("add.virtual")}</p>
            <CustomButton className="!p-1 !rounded" size={"icon"} onClick={onAddVirtualAccount}>
              <img src={PlusIcon} alt="plus-icon" className="w-4 h-4" />
            </CustomButton>
          </div>
        )}
      </div>

      <div className="flex w-full">{subInfoType === SubaccountInfoEnum.Enum.VIRTUALS ? children : null}</div>
    </div>
  ) : null;
};

export default SubaccountInfo;
