// svgs
import { ReactComponent as WalletIcon } from "@/assets/svg/files/wallet-icon.svg";
import { ReactComponent as RefreshIcon } from "@/assets/svg/files/refresh-ccw.svg";
import { ReactComponent as HplLogo } from "@/assets/svg/files/hpl-logo.svg";
import { ReactComponent as HpllogoLight } from "@/assets/svg/files/hpl-wallet-light.svg";
import icUrl from "@/assets/img/icp-logo.png";
import ethUrl from "@assets/svg/files/ethereum-icon.svg";
//
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ThemeHook } from "@hooks/themeHook";
import { AccountHook } from "@hooks/accountHook";
import { ThemesEnum } from "@/const";
import { CustomCopy } from "@components/tooltip";
import { useAppSelector } from "@redux/Store";
import Setings from "../Settings";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { useAccount } from "wagmi";
import Pill from "./Pill";
import getTotalAmountInCurrency from "@pages/helpers/getTotalAmountInCurrency";
import reloadBallance from "@pages/helpers/reloadBalance";

const TopBarComponent = ({ isLoginPage }: { isLoginPage: boolean }) => {
  const { t } = useTranslation();
  const { watchOnlyMode } = useAppSelector((state) => state.auth);
  const { isAppDataFreshing } = useAppSelector((state) => state.common);
  const { theme } = ThemeHook();
  const { authClient } = AccountHook();

  const { identity, clear: clearSiweIdentity } = useSiweIdentity();
  const { address } = useAccount();
  return (
    <Fragment>
      <div className="flex flex-row justify-between min-h-[4.5rem] w-full bg-PrimaryColorLight dark:bg-PrimaryColor text-PrimaryTextColorLight dark:text-PrimaryTextColor ">
        <div className="flex flex-row items-center justify-start gap-24 pl-9 text-md">
          {theme === ThemesEnum.enum.dark ? (
            <HplLogo className="max-w-[7rem] h-auto" />
          ) : (
            <HpllogoLight className="max-w-[7rem] h-auto" />
          )}
          {!isLoginPage && (
            <div className="flex flex-row items-center justify-start gap-3">
              {identity && <Pill text={address as string} start={6} end={4} icon={ethUrl} />}
              <Pill text={authClient} start={12} end={10} icon={icUrl} />
              <CustomCopy size={"small"} copyText={authClient} />
              <RefreshIcon
                className={`h-4 w-4 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor ${
                  isAppDataFreshing ? "do-spin" : ""
                }`}
                onClick={handleReloadButton}
              />
              {watchOnlyMode && <p className="opacity-50">{t("watchOnlyMode.title")}</p>}
            </div>
          )}
        </div>
        <div className="flex flex-row items-center justify-start pr-9 gap-9">
          {!isLoginPage && (
            <div className="flex flex-row items-center justify-start gap-2 text-md">
              <WalletIcon className="fill-SvgColor dark:fill-SvgColor max-w-[1.5rem] h-auto"></WalletIcon>
              <p className="opacity-70">{t("total.balance")}:</p>
              <p className="font-medium">{`$${getTotalAmountInCurrency().toFixed(2)}`}</p>
              <p className="opacity-70">USD</p>
            </div>
          )}
          <Setings isLoginPage={isLoginPage} clearSiweIdentity={clearSiweIdentity} />
        </div>
      </div>
    </Fragment>
  );

  async function handleReloadButton() {
    await reloadBallance();
  }
};
export default TopBarComponent;
