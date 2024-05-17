import { useTranslation } from "react-i18next";
import AuthMethodRender from "./AuthMethodRender";
import Setings from "@pages/components/Settings";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AuthMethods() {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <LanguageSwitcher />
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h2 className="text-[2rem] font-bold text-PrimaryTextColorLight dark:text-PrimaryTextColor">
          {t("login.title")}
        </h2>
        <AuthMethodRender />
      </div>
      <div className="flex flex-col items-center justify-center text-center pt-14 pb-14">
        <p className="text-lg font-light text-PrimaryTextColorLight dark:text-PrimaryTextColor">
          {t("login.bottom.msg")}
        </p>
        <p className="text-lg font-light text-PrimaryTextColorLight dark:text-PrimaryTextColor">
          <span className="text-lg font-bold">{t("login.bottom.msg.terms")}</span> {t("and")}{" "}
          <span>{t("login.bottom.msg.policy")}</span>
        </p>
      </div>
      <div className="absolute flex flex-row items-center justify-center right-8 top-6 bg-none">
        <Setings isLoginPage={true} />
      </div>
    </div>
  );
}
