// svgs
import { ReactComponent as WalletIcon } from "@/assets/svg/files/wallet-icon.svg";
import { ReactComponent as RefreshIcon } from "@/assets/svg/files/refresh-ccw.svg";
import { ReactComponent as HplLogo } from "@/assets/svg/files/hpl-logo.svg";
import { ReactComponent as HpllogoLight } from "@/assets/svg/files/hpl-wallet-light.svg";
//
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ThemeHook } from "@hooks/themeHook";
import { AccountHook } from "@hooks/accountHook";
import { shortAddress } from "@/utils";
import { ThemesEnum } from "@/const";
import { CustomCopy } from "@components/CopyTooltip";
import { AssetHook } from "@pages/home/hooks/assetHook";
import { useAppSelector } from "@redux/Store";
import Setings from "../Settings";

const TopBarComponent = ({ isLoginPage }: { isLoginPage: boolean }) => {
  const { t } = useTranslation();
  const { watchOnlyMode } = useAppSelector((state) => state.auth);
  const { theme } = ThemeHook();
  const { authClient } = AccountHook();
  const { getTotalAmountInCurrency, reloadBallance, assetLoading } = AssetHook();

  return (
    <Fragment>
      <div className="flex flex-row justify-between min-h-[4.5rem] w-full bg-PrimaryColorLight dark:bg-PrimaryColor text-PrimaryTextColorLight dark:text-PrimaryTextColor ">
        <div className="flex flex-row justify-start items-center pl-9 gap-24 text-md">
          {theme === ThemesEnum.enum.dark ? (
            <HplLogo className="max-w-[7rem] h-auto" />
          ) : (
            <HpllogoLight className="max-w-[7rem] h-auto" />
          )}
          {!isLoginPage && (
            <div className="flex flex-row justify-start items-center gap-3">
              <p className="opacity-50">{shortAddress(authClient, 12, 10)}</p>
              <CustomCopy size={"small"} copyText={authClient} />
              <RefreshIcon
                className={`h-4 w-4 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor ${
                  assetLoading ? "do-spin" : ""
                }`}
                onClick={handleReloadButton}
              />
              {watchOnlyMode && <p className="opacity-50">{t("watchOnlyMode.title")}</p>}
            </div>
          )}
        </div>
        <div className="flex flex-row justify-start items-center pr-9 gap-9">
          {!isLoginPage && (
            <div className="flex flex-row justify-start items-center gap-2 text-md">
              <WalletIcon className="fill-SvgColor dark:fill-SvgColor max-w-[1.5rem] h-auto"></WalletIcon>
              <p className="opacity-70">{t("total.balance")}:</p>
              <p className="font-medium">{`$${getTotalAmountInCurrency().toFixed(2)}`}</p>
              <p className="opacity-70">USD</p>
            </div>
          )}
          <Setings isLoginPage={isLoginPage} />
        </div>
      </div>
    </Fragment>
  );

  function handleReloadButton() {
    reloadBallance();
  }
};
export default TopBarComponent;
