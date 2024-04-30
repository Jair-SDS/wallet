// svgs
import { ReactComponent as ChevronIcon } from "@/assets/svg/files/chevron-right.svg";
import { ReactComponent as SunIcon } from "@/assets/svg/files/sun-icon.svg";
import { ReactComponent as UsaFlagIcon } from "@/assets/svg/files/usa.svg";
import { ReactComponent as SpainFlagIcon } from "@/assets/svg/files/españa.svg";
import { ReactComponent as ItalyFlagIcon } from "@/assets/svg/files/italia.svg";
import { ReactComponent as BrazilFlagIcon } from "@/assets/svg/files/brazil.svg";
//
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Fragment, useState } from "react";
import { clsx } from "clsx";
import { BasicModal } from "@components/modal";
import { ThemeHook } from "@pages/hooks/themeHook";
import { LanguageHook } from "@pages/hooks/languageHook";
import { useTranslation } from "react-i18next";
import { logout } from "@redux/CheckAuth";
import ThemeModal from "./topbar/themeModal";
import HplSettingsModal from "./topbar/hplSettings";
import DbLocationModal from "./topbar/dbLocationModal";
import i18n from "@/i18n";
import { db } from "@/database/db";

const langOpts = [
  { abrev: "en", name: "english", flag: <UsaFlagIcon className={"mr-1 max-h-[1.5rem]"} /> },
  { abrev: "es", name: "spanish", flag: <SpainFlagIcon className={"mr-1 max-h-[1.5rem]"} /> },
  { abrev: "it", name: "italian", flag: <ItalyFlagIcon className={"mr-1 max-h-[1.5rem]"} /> },
  { abrev: "pt", name: "portuguese", flag: <BrazilFlagIcon className={"mr-1 max-h-[1.5rem]"} /> },
];

const Setings = ({ isLoginPage, clearSiweIdentity }: { isLoginPage: boolean; clearSiweIdentity?: any }) => {
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [dbLocationOpen, setDbLocationOpen] = useState(false);
  const { themeOpen, setThemeOpen } = ThemeHook();
  const { onLanguageChange } = LanguageHook();
  return (
    <Fragment>
      <DropdownMenu.Root
        modal={false}
        onOpenChange={() => {
          setLangOpen(false);
        }}
      >
        <DropdownMenu.Trigger asChild>
          <button className="p-0 outline-none">
            <SunIcon className="fill-SvgColor dark:fill-SvgColor max-w-[2rem] h-auto"></SunIcon>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="text-lg bg-PrimaryColorLight rounded-lg dark:bg-SecondaryColor mr-4 z-[999] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo"
            sideOffset={5}
          >
            <DropdownMenu.Item
              className={clsx(gearPopItem, "!justify-between", "rounded-t-lg")}
              onSelect={(e: Event) => {
                e.preventDefault();
                setLangOpen(!langOpen);
              }}
            >
              <p>{t("language.word")}</p>
              <ChevronIcon className={`fill-SvgColor dark:fill-SvgColor ${langOpen ? "" : "-rotate-90"}`} />
            </DropdownMenu.Item>
            {langOpen &&
              langOpts.map((lOpt, k) => {
                return (
                  <DropdownMenu.Item
                    key={k}
                    className={clsx(gearPopItem)}
                    onSelect={() => {
                      setLangOpen(false);
                      changeLanguage(lOpt.abrev);
                    }}
                  >
                    {lOpt.flag}
                    <p>{t(lOpt.name)}</p>
                  </DropdownMenu.Item>
                );
              })}
            <DropdownMenu.Item
              className={clsx(gearPopItem, "!justify-between")}
              onSelect={() => {
                setThemeOpen("THEMES");
              }}
            >
              <p>{t("themes")}</p>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={clsx(gearPopItem, "!justify-between")}
              onSelect={() => {
                setThemeOpen("SETTINGS");
              }}
            >
              <p>{t("hpl.settings")}</p>
            </DropdownMenu.Item>
            {isLoginPage && (
              <DropdownMenu.Item
                className={clsx(gearPopItem, "!justify-between", "rounded-b-lg")}
                onSelect={() => {
                  setDbLocationOpen(true);
                }}
              >
                <p>{t("database.location")}</p>
              </DropdownMenu.Item>
            )}
            {!isLoginPage && (
              <DropdownMenu.Item
                className={clsx(gearPopItem, "!justify-between", "rounded-b-lg")}
                onSelect={() => {
                  logout();
                  clearSiweIdentity && clearSiweIdentity();
                }}
              >
                <p className="text-LockColor">{t("lock")}</p>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <BasicModal open={themeOpen !== ""} top="top-[35%]">
        {themeOpen === "THEMES" ? <ThemeModal setOpen={setThemeOpen} /> : <HplSettingsModal setOpen={setThemeOpen} />}
      </BasicModal>
      <BasicModal open={dbLocationOpen} top="top-[35%]">
        <DbLocationModal setOpen={setDbLocationOpen} />
      </BasicModal>
    </Fragment>
  );
  function changeLanguage(lang: string) {
    onLanguageChange(lang);
    i18n.changeLanguage(lang, () => {
      db().setLanguage(lang);
    });
  }
};

export default Setings;

const gearPopItem = clsx(
  "flex",
  "flex-row",
  "justify-start",
  "items-center",
  "py-2",
  "px-4",
  "bg-none",
  "w-full",
  "min-w-[13rem]",
  "cursor-pointer",
  "outline-none",
  "hover:bg-PopSelectColorLight",
  "dark:hover:bg-PopSelectColor",
);
