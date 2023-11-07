// svgs
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { ReactComponent as ChevIcon } from "@assets/svg/files/chev-icon.svg";
import PlusIcon from "@assets/svg/files/plus-icon.svg";
//
import { getContactColor, getInitialFromName, shortAddress } from "@/utils";
import { CustomCopy } from "@components/CopyTooltip";
import { CustomInput } from "@components/Input";
import { HplContact } from "@redux/models/AccountModels";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHplContacts } from "@pages/contacts/hooks/hplContactsHook";

interface TableHplContactsProps {
  setAddOpen(value: boolean): void;
  setEdit(value: HplContact | undefined): void;
}

const TableHplContacts = ({ setAddOpen, setEdit }: TableHplContactsProps) => {
  const { hplContacts, saveHplContacts } = useHplContacts();
  const { t } = useTranslation();
  const [selContact, setSelContact] = useState<HplContact>();
  const [contactOpen, setContactOpen] = useState("");

  return (
    <table className="w-full  text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
      <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo text-PrimaryTextColor/70 sticky top-0 z-[1]">
        <tr className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">
          <th className="p-2 text-left w-[30%] bg-PrimaryColorLight dark:bg-PrimaryColor ">
            <p>{t("name")}</p>
          </th>
          <th className="p-2 text-left w-[40%] bg-PrimaryColorLight dark:bg-PrimaryColor">
            <p>{"Principal"}</p>
          </th>
          <th className="p-2 w-[15%] bg-PrimaryColorLight dark:bg-PrimaryColor">
            <p>{t("remote.accounts")}</p>
          </th>
          <th className="p-2 w-[12%] bg-PrimaryColorLight dark:bg-PrimaryColor">
            <p>{t("action")}</p>
          </th>
          <th className="w-[3%] bg-PrimaryColorLight dark:bg-PrimaryColor"></th>
        </tr>
      </thead>
      <tbody>
        {getContactsToShow().map((cntc, k) => {
          const selected = cntc.principal === selContact?.principal;
          const open = contactOpen === cntc.principal;
          return (
            <tr key={k} className={`${selected || open ? "bg-SelectRowColor/20" : ""}`}>
              <td>
                <div className="relative flex flex-row justify-start items-center w-full min-h-14 gap-2 px-4 py-1">
                  {(selected || open) && <div className="absolute left-0 w-1 h-full bg-SelectRowColor"></div>}
                  {selected ? (
                    <CustomInput
                      intent={"primary"}
                      border={selContact.name.trim() === "" ? "error" : "selected"}
                      sizeComp={"xLarge"}
                      sizeInput="small"
                      value={selContact.name}
                      onChange={onContactNameChange}
                    />
                  ) : (
                    <div className="flex flex-row justify-start items-center w-full gap-2">
                      <div
                        className={`flex justify-center items-center !min-w-[2rem] w-8 h-8 rounded-md ${getContactColor(
                          k,
                        )}`}
                      >
                        <p className="text-PrimaryTextColor">{getInitialFromName(cntc.name, 2)}</p>
                      </div>
                      <p className="text-left opacity-70 break-words w-full max-w-[14rem]">{cntc.name}</p>
                    </div>
                  )}
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-row justify-start items-center gap-2 opacity-70 px-2">
                  <p>{shortAddress(cntc.principal, 12, 9)}</p>
                  <CustomCopy size={"xSmall"} className="p-0" copyText={cntc.principal} />
                </div>
              </td>
              <td>
                <div className="flex flex-row justify-center items-center w-full">
                  <div
                    className={
                      "flex flex-row justify-between items-center w-28 h-8 rounded bg-black/10 dark:bg-white/10"
                    }
                  >
                    <p className="ml-2">{`${cntc.remotes.length} R.A.`}</p>
                    <button
                      className="flex justify-center items-center p-0 h-full bg-AccpetButtonColor rounded-md w-8"
                      onClick={() => {
                        onAddRemotes(cntc);
                      }}
                    >
                      <img src={PlusIcon} alt="plus-icon" />
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex flex-row justify-center items-start gap-4 w-full">
                  {selected ? (
                    <CheckIcon
                      onClick={() => {
                        onSave(cntc);
                      }}
                      className="w-4 h-4 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor opacity-50 cursor-pointer"
                    />
                  ) : (
                    <PencilIcon
                      onClick={() => {
                        onEdit(cntc);
                      }}
                      className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor opacity-50 cursor-pointer"
                    />
                  )}
                  {selected ? (
                    <CloseIcon
                      onClick={onClose}
                      className="w-5 h-5 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor opacity-50 cursor-pointer"
                    />
                  ) : (
                    <TrashIcon
                      onClick={() => {
                        onDelete(cntc);
                      }}
                      className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor cursor-pointer"
                    />
                  )}
                </div>
              </td>
              <td>
                <div className="flex flex-row justify-center items-start gap-2 w-full">
                  <ChevIcon
                    onClick={() => {
                      onChevIconClic(cntc);
                    }}
                    className={`w-8 h-8 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor stroke-0  cursor-pointer ${
                      selected || open ? "" : "rotate-90"
                    }`}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  function getContactsToShow() {
    return hplContacts.filter((cntc) => {
      return true;
    });
  }

  function onContactNameChange(e: ChangeEvent<HTMLInputElement>) {
    setSelContact((prev) => {
      return prev ? { ...prev, name: e.target.value } : undefined;
    });
  }

  function onAddRemotes(cntc: HplContact) {
    setEdit(cntc);
    setAddOpen(true);
  }

  function onSave(cntc: HplContact) {
    saveHplContacts(
      hplContacts.map((contact) => {
        if (cntc.principal === contact.principal) {
          return { ...contact, name: selContact?.name || "" };
        } else return contact;
      }),
    );
  }
  function onEdit(cntc: HplContact) {
    setSelContact(cntc);
  }
  function onClose() {
    setSelContact(undefined);
  }
  function onDelete(cntc: HplContact) {}
  function onChevIconClic(cntc: HplContact) {
    if (cntc.principal === selContact?.principal || contactOpen === cntc.principal) setContactOpen("");
    else setContactOpen(cntc.principal);
  }
};

export default TableHplContacts;
