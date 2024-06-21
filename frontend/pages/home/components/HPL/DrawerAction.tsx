// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { Fragment, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/button";
import { DrawerOption } from "@common/const";
import { resetSendStateAction } from "@redux/transaction/HplTransactionActions";

interface Option {
  name: string;
  type: DrawerOption;
  disabled?: boolean;
}
interface DrawerActionProps extends PropsWithChildren {
  drawerOption: DrawerOption;
  setDrawerOption(value: DrawerOption): void;
  setDrawerOpen(value: boolean): void;
  options?: Array<Option>;
}

const DrawerAction = ({ drawerOption, setDrawerOption, setDrawerOpen, children, options }: DrawerActionProps) => {
  const { t } = useTranslation();

  const selectedButton = "border-AccpetButtonColor";
  const unselectedButton = "text-PrimaryTextColorLight dark:text-PrimaryTextColor";

  return (
    <Fragment>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-row items-center justify-start w-full gap-4">
          {options?.map((dOpt, k) => {
            return (
              <CustomButton
                key={k}
                intent={"noBG"}
                border={"underline"}
                className={getButtonClassNames(dOpt)}
                onClick={() => handleDrawerOptionClick(dOpt)}
              >
                <p className="font-semibold">{t(dOpt.name)}</p>
              </CustomButton>
            );
          })}
        </div>
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setDrawerOpen(false);
            resetSendStateAction();
          }}
        />
      </div>
      {children}
    </Fragment>
  );

  function getButtonSelectionStyle(option: Option) {
    return drawerOption === option.type ? selectedButton : unselectedButton;
  }

  function getButtonClassNames(option: Option) {
    const defaultClassNames = "!font-light";
    if (option.disabled) return `${defaultClassNames} ${unselectedButton} pointer-events-none`;
    return `${defaultClassNames} ${getButtonSelectionStyle(option)}`;
  }

  function handleDrawerOptionClick(option: Option) {
    setDrawerOption(option.type);
  }
};

export default DrawerAction;
