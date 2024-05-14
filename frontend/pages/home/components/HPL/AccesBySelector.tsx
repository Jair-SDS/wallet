// svgs
import SearchIcon from "@assets/svg/files/icon-search.svg";
import ChevIcon from "@assets/svg/files/chev-icon.svg";
//
import { CustomInput } from "@components/input";
import { shortAddress } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HPLVirtualSubAcc, HplContact } from "@redux/models/AccountModels";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BasicSwitch } from "@components/switch";

interface AccesBySelectorProps {
  newVt: HPLVirtualSubAcc;
  setNewVt(value: HPLVirtualSubAcc): void;
  onAccesChange(e: ChangeEvent<HTMLInputElement>): void;
  accesErr: boolean;
  setAccesErr(value: boolean): void;
  openSlider: boolean;
}

const AccesBySelector = ({
  newVt,
  setNewVt,
  onAccesChange,
  accesErr,
  setAccesErr,
  openSlider,
}: AccesBySelectorProps) => {
  const { hplContacts } = useHPL(false);
  const { t } = useTranslation();

  const [searchKey, setSearchKey] = useState("");
  const [remotesOpen, setRemotesOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selContact, setSelContact] = useState<HplContact>();

  useEffect(() => {
    if (openSlider) {
      setSearchKey("");
      setIsNew(false);
      setSelContact(undefined);
      setAccesErr(false);
    }
  }, [openSlider]);

  return (
    <div className="flex flex-col justify-start items-start w-full gap-2">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="opacity-60">
          {t("access.by")} <span className="text-RadioCheckColor">*</span>
        </p>
        <div className="flex items-center justify-between w-3/6 px-2 py-1 rounded-md bg-PrimaryColorLight dark:bg-ThemeColorBack">
          <p className="text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("contact.book")}</p>
          <BasicSwitch checked={isNew} onChange={onContactBookChange} disabled={false} />
          <p className="text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("new")}</p>
        </div>
      </div>
      {isNew ? (
        <CustomInput
          sizeInput={"small"}
          intent={"secondary"}
          compOutClass=""
          value={newVt.accesBy}
          onChange={onAccesChange}
          border={accesErr ? "error" : undefined}
        />
      ) : (
        <DropdownMenu.Root
          open={remotesOpen}
          onOpenChange={(e: boolean) => {
            setRemotesOpen(e);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <div
              className={`flex flex-row justify-between items-center w-full rounded-md border cursor-pointer p-2 ${
                remotesOpen ? "border-SelectRowColor" : "border-gray-color-2"
              }`}
            >
              {selContact ? (
                <div className="flex flex-row justify-start items-center gap-3">
                  <div className="flex justify-center items-center w-8 h-8 rounded-md bg-gray-color-4">
                    <p className="text-PrimaryTextColor">{selContact.name[0].toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col justify-start items-start text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-70">
                    <p>{selContact.name}</p>
                    <p>{shortAddress(selContact.principal, 6, 4)}</p>
                  </div>
                </div>
              ) : (
                <p>{t("select.contact")}</p>
              )}
              <img
                src={ChevIcon}
                style={{ width: "2rem", height: "2rem" }}
                alt="chevron-icon"
                className={`${remotesOpen ? "rotate-90" : ""}`}
              />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="text-lg bg-PrimaryColorLight w-[25rem] rounded-lg dark:bg-SecondaryColor z-[2000] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo"
              sideOffset={1}
              align="end"
            >
              <div className="flex flex-col justify-start items-start w-full gap-[1px]">
                <CustomInput
                  prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
                  sizeInput={"small"}
                  intent={"secondary"}
                  placeholder=""
                  compOutClass=""
                  value={searchKey}
                  onChange={onSearchChange}
                />
                {hplContacts.length > 0 && (
                  <div className="flex flex-col justify-start items-start w-full scroll-y-light max-h-[calc(100vh-30rem)] border border-BorderColorLight dark:border-BorderColor rounded">
                    {hplContacts
                      .filter((cntc) => {
                        return (
                          cntc.name.toLowerCase().includes(searchKey.toLowerCase()) ||
                          cntc.principal.toLowerCase().includes(searchKey.toLowerCase())
                        );
                      })
                      .map((cntc, k) => {
                        return (
                          <div
                            key={k}
                            className="p-1 flex flex-row justify-start items-center w-full rounded cursor-pointer gap-2 text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor hover:bg-HoverColorLight/20 dark:hover:bg-HoverColor "
                            onClick={() => {
                              onSelectBacking(cntc);
                            }}
                          >
                            <div className="flex flex-row justify-start items-center gap-3">
                              <div className="flex justify-center items-center w-8 h-8 rounded-md bg-gray-color-4">
                                <p className="text-PrimaryTextColor">{cntc.name[0].toUpperCase()}</p>
                              </div>
                              <div className="flex flex-col justify-start items-start text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-70">
                                <p>{cntc.name}</p>
                                <p>{shortAddress(cntc.principal, 6, 4)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function onSelectBacking(cntc: HplContact) {
    setNewVt({ ...newVt, accesBy: cntc.principal });
    setRemotesOpen(false);
    setAccesErr(false);
    setSelContact(cntc);
  }
  function onContactBookChange(checked: boolean) {
    setIsNew(checked);
    setSelContact(undefined);
    setSearchKey("");
    setNewVt({ ...newVt, accesBy: "" });
    setAccesErr(false);
  }
};

export default AccesBySelector;
