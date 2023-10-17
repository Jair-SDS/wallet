// svgs
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/Input";
import Modal from "@components/Modal";
import { useHPL } from "@pages/hooks/hplHook";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HPLSubAccount, HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { clsx } from "clsx";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/Button";

interface BackingSelectorProps {
  newVt: HPLVirtualSubAcc;
  setNewVt(value: HPLVirtualSubAcc): void;
}

const BackingSelector = ({ newVt, setNewVt }: BackingSelectorProps) => {
  const { t } = useTranslation();
  const { subaccounts, selectSub, getSubFromVt, selAssetOpen, setSelAssetOpen, selectVt } = useHPL(false);

  const [searchKey, setSearchKey] = useState("");
  const [selBacking, setSelBacking] = useState({ id: "-1", name: "" });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col justify-between items-center w-full mb-3">
      <p className="w-full text-left opacity-60">{t("backing.account")}</p>
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
            <div className="flex flex-row justify-start items-center w-full px-2 py-1 border border-BorderColorLight dark:border-BorderColor rounded-md">
              {newVt.backing === "" ? (
                <div className="flex flex-row justify-between items-center w-full">
                  <p className="opacity-60">{t("select.backing")}</p>
                  <img
                    src={ChevIcon}
                    style={{ width: "2rem", height: "2rem" }}
                    alt="chevron-icon"
                    className={`${selAssetOpen ? "rotate-90" : ""}`}
                  />
                </div>
              ) : (
                <div className="flex flex-row justify-between items-center w-full">
                  <div className="p-1 flex flex-row justify-start items-center w-full gap-2 text-sm">
                    <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                      <p className=" text-PrimaryTextColor">{getSubFromVt(newVt.backing).sub_account_id}</p>
                    </div>
                    <p>{getSubFromVt(newVt.backing).name}</p>
                  </div>
                  <img
                    src={ChevIcon}
                    style={{ width: "2rem", height: "2rem" }}
                    alt="chevron-icon"
                    className={`${selAssetOpen ? "rotate-90" : ""}`}
                  />
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
            <div className="flex flex-col justify-start items-start w-full p-1 gap-2">
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
                    const editedValid = selectSub ? selectSub.ft === sub.ft : true;
                    return (
                      (sub.name.toLowerCase().includes(key) || sub.sub_account_id.toString().includes(key)) &&
                      editedValid
                    );
                  })
                  .map((sub, k) => {
                    return (
                      <button
                        key={k}
                        className="p-1 flex flex-row justify-start items-center w-full gap-2 text-sm hover:bg-HoverColorLight dark:hover:bg-HoverColor"
                        onClick={() => {
                          onSelectBacking(sub);
                        }}
                      >
                        <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                          <p className=" text-PrimaryTextColor">{sub.sub_account_id}</p>
                        </div>
                        <p>{sub.name}</p>
                      </button>
                    );
                  })}
              </div>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Modal
        open={modalOpen}
        width="w-[21rem]"
        padding="p-5"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
      >
        <div className="flex flex-col justify-start items-start w-full text-md">
          <div className="flex flex-row justify-between items-center w-full mb-4">
            <WarningIcon className="w-6 h-6" />
            <CloseIcon
              className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
              onClick={() => {
                setModalOpen(false);
              }}
            />
          </div>
          <p className=" text-justify w-full mb-2">{t("change.backing.1")}</p>
          <p className="mb-1">
            <span className="font-semibold">{selectVt?.name || t("It")}</span> {t("change.backing.2")}
          </p>
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="flex justify-center items-center py-1 px-2 bg-slate-500 rounded-md">
              <p className=" text-PrimaryTextColor text-sm">{selBacking.id}</p>
            </div>
            <p>{selBacking.name}</p>
          </div>
          <div className="w-full flex flex-row justify-end items-center mt-2">
            <CustomButton className="min-w-[5rem]" onClick={onConfirmChange} size={"small"}>
              <p>{t("yes")}</p>
            </CustomButton>
          </div>
        </div>
      </Modal>
    </div>
  );
  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function onSelectBacking(sub: HPLSubAccount) {
    setSelBacking({ id: sub.sub_account_id, name: sub.name });
    setModalOpen(true);
  }
  function onConfirmChange() {
    setNewVt({ ...newVt, backing: selBacking.id });
    setSelAssetOpen(false);
    setModalOpen(false);
  }
};

export default BackingSelector;
