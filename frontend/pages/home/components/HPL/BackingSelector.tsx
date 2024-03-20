// svgs
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/input";
import { BasicModal } from "@components/modal";
import { useHPL } from "@pages/hooks/hplHook";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HPLSubAccount, HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { clsx } from "clsx";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/button";
import AssetSymbol from "@components/AssetSymbol";

interface BackingSelectorProps {
  newVt: HPLVirtualSubAcc;
  setNewVt(value: HPLVirtualSubAcc): void;
  edit: boolean;
}

const BackingSelector = ({ newVt, setNewVt, edit }: BackingSelectorProps) => {
  const { t } = useTranslation();
  const {
    subaccounts,
    selectSub,
    getSubFromVt,
    getFtFromVt,
    getFtFromSub,
    selAssetOpen,
    setSelAssetOpen,
    selectVt,
    getAssetLogo,
  } = useHPL(false);

  const [searchKey, setSearchKey] = useState("");
  const [selBacking, setSelBacking] = useState({ id: "-1", name: "" });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-between w-full mb-3">
      <p className="w-full text-left opacity-60">
        {t("backing.account")} <span className="text-RadioCheckColor">*</span>
      </p>
      <DropdownMenu.Root
        open={selAssetOpen}
        onOpenChange={(e: boolean) => {
          setSelAssetOpen(e);
        }}
      >
        <DropdownMenu.Trigger asChild>
          <div
            className={clsx(
              "flex justify-start items-start",
              "border-BorderColorLight dark:border-BorderColor",
              "cursor-pointer",
              "!w-full",
              "pr-0",
            )}
          >
            <div className="flex flex-row items-center justify-start w-full px-2 py-1 border rounded-md border-BorderColorLight dark:border-BorderColor">
              {newVt.backing === "" ? (
                <div className="flex flex-row items-center justify-between w-full">
                  <p className="opacity-60">{t("select.backing")}</p>
                  <img
                    src={ChevIcon}
                    style={{ width: "2rem", height: "2rem" }}
                    alt="chevron-icon"
                    className={`${selAssetOpen ? "rotate-90" : ""}`}
                  />
                </div>
              ) : (
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-row items-center justify-start gap-2 p-1 text-sm">
                    <div className="flex items-center justify-center px-3 py-1 rounded-md bg-slate-500">
                      <p className=" text-PrimaryTextColor">{getSubFromVt(newVt.backing).sub_account_id}</p>
                    </div>
                    <p className="text-left">{getSubFromVt(newVt.backing).name}</p>
                  </div>
                  <div className="flex flex-row items-center justify-start gap-2">
                    <AssetSymbol ft={getFtFromVt(newVt.backing)} />
                    <img src={getAssetLogo(getFtFromVt(newVt.backing).id)} className="w-5 h-5" alt="info-icon" />
                    <img
                      src={ChevIcon}
                      style={{ width: "2rem", height: "2rem" }}
                      alt="chevron-icon"
                      className={`${selAssetOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="text-lg bg-PrimaryColorLight w-[25rem] rounded-lg dark:bg-SecondaryColor z-[2000] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-SelectRowColor"
            sideOffset={5}
            align="end"
          >
            <div className="flex flex-col items-start justify-start w-full gap-2 p-1">
              <CustomInput
                prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
                sizeInput={"small"}
                intent={"secondary"}
                placeholder=""
                compOutClass=""
                value={searchKey}
                onChange={onSearchChange}
              />
              <div className="flex flex-col justify-start items-start w-full scroll-y-light max-h-[calc(100vh-30rem)]">
                {subaccounts
                  .filter((sub) => {
                    const key = searchKey.toLowerCase();
                    const editedValid = !edit ? true : selectSub ? selectSub.ft === sub.ft : true;
                    return (
                      (sub.name.toLowerCase().includes(key) || sub.sub_account_id.toString().includes(key)) &&
                      editedValid
                    );
                  })
                  .map((sub, k) => {
                    return (
                      <button
                        key={k}
                        className="flex flex-row items-center justify-between w-full gap-2 p-1 text-sm hover:bg-HoverColorLight dark:hover:bg-HoverColor"
                        onClick={() => {
                          onSelectBacking(sub);
                        }}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center justify-center px-3 py-1 rounded-md bg-slate-500">
                            <p className=" text-PrimaryTextColor">{sub.sub_account_id}</p>
                          </div>
                          <p className="text-left">{sub.name}</p>
                        </div>

                        <div className="flex flex-row items-center justify-start gap-2 pr-10">
                          <AssetSymbol ft={getFtFromSub(sub.ft)} />
                          <img src={getAssetLogo(getFtFromSub(sub.ft).id)} className="w-5 h-5" alt="info-icon" />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <BasicModal
        open={modalOpen}
        width="w-[21rem]"
        padding="p-5"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
      >
        <div className="flex flex-col items-start justify-start w-full text-md">
          <div className="flex flex-row items-center justify-between w-full mb-4">
            <WarningIcon className="w-6 h-6" />
            <CloseIcon
              className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
              onClick={() => {
                setModalOpen(false);
              }}
            />
          </div>
          <p className="w-full mb-2 text-justify ">{t("change.backing.1")}</p>
          <p className="mb-1">
            <span className="font-semibold">{selectVt?.name || t("It")}</span> {t("change.backing.2")}
          </p>
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="flex items-center justify-center px-2 py-1 rounded-md bg-slate-500">
              <p className="text-sm  text-PrimaryTextColor">{selBacking.id}</p>
            </div>
            <p>{selBacking.name}</p>
          </div>
          <div className="flex flex-row items-center justify-end w-full mt-2">
            <CustomButton className="min-w-[5rem]" onClick={onConfirmChange} size={"small"}>
              <p>{t("yes")}</p>
            </CustomButton>
          </div>
        </div>
      </BasicModal>
    </div>
  );
  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function onSelectBacking(sub: HPLSubAccount) {
    if (edit) {
      setSelBacking({ id: sub.sub_account_id, name: sub.name });
      setModalOpen(true);
    } else {
      setSelBacking({ id: sub.sub_account_id, name: sub.name });
      setNewVt({ ...newVt, backing: sub.sub_account_id });
      setSelAssetOpen(false);
    }
  }
  function onConfirmChange() {
    setNewVt({ ...newVt, backing: selBacking.id });
    setSelAssetOpen(false);
    setModalOpen(false);
  }
};

export default BackingSelector;
