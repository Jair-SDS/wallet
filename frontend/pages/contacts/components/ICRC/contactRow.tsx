// svgs
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as ChevIcon } from "@assets/svg/files/chev-icon.svg";
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/Input";
import { AssetContact, Contact, ContactErr } from "@redux/models/ContactsModels";
import { clsx } from "clsx";
import { ChangeEvent } from "react";
import { getContactColor, getInitialFromName, shortAddress } from "@/utils";
import { CustomCopy } from "@components/CopyTooltip";
import ContactAssetPop from "./contactAssetPop";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { AssetToAdd } from "@redux/models/AccountModels";
import { useContacts } from "../../hooks/contactsHook";
import { useTranslation } from "react-i18next";

interface ContactRowProps {
  cntc: Contact;
  k: number;
  selContactPrin: string;
  openAssetsPrin: string;
  selCntcPrinAddAsst: string;
  contactEditedErr: ContactErr;
  contactEdited: Contact;
  setContactEdited(val: Contact): void;
  setContactEditedErr(val: ContactErr): void;
  onAddAssetPopOpen(cntc: Contact): void;
  setSelCntcPrinAddAsst(val: string): void;
  onSave(cntc: Contact): void;
  onEdit(cntc: Contact): void;
  onClose(): void;
  onDelete(cntc: Contact): void;
  onChevIconClic(cntc: Contact): void;
}

const ContactRow = ({
  cntc,
  k,
  selContactPrin,
  openAssetsPrin,
  selCntcPrinAddAsst,
  contactEditedErr,
  contactEdited,
  setContactEdited,
  setContactEditedErr,
  onAddAssetPopOpen,
  setSelCntcPrinAddAsst,
  onSave,
  onEdit,
  onClose,
  onDelete,
  onChevIconClic,
}: ContactRowProps) => {
  const { t } = useTranslation();
  const { assets, getAssetIcon } = GeneralHook();
  const { addAsset } = useContacts();
  return (
    <tr className={contactStyle(cntc)}>
      <td className="">
        <div className="relative flex flex-row justify-start items-center w-full min-h-14 gap-2 px-4">
          {(cntc.principal === selContactPrin ||
            cntc.principal === openAssetsPrin ||
            cntc.principal === selCntcPrinAddAsst) && (
            <div className="absolute left-0 w-1 h-14 bg-SelectRowColor"></div>
          )}
          {cntc.principal === selContactPrin ? (
            <CustomInput
              intent={"primary"}
              border={contactEditedErr.name ? "error" : "selected"}
              sizeComp={"xLarge"}
              sizeInput="small"
              value={contactEdited.name}
              onChange={onContactNameChange}
            />
          ) : (
            <div className="flex flex-row justify-start items-center w-full gap-2">
              <div
                className={`flex justify-center items-center !min-w-[2rem] w-8 h-8 rounded-md ${getContactColor(k)}`}
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
      <td className="py-2">
        <div className="flex flex-row justify-center items-center w-full">
          <div className={"flex flex-row justify-between items-center w-28 h-8 rounded bg-black/10 dark:bg-white/10"}>
            <p className="ml-2">{`${cntc.assets.length} ${t("assets")}`}</p>
            <ContactAssetPop
              compClass="flex flex-row justify-center items-center"
              btnClass="!w-8 !h-8 bg-AddSecondaryButton rounded-l-none"
              assets={getFilteredAssets(cntc)}
              getAssetIcon={getAssetIcon}
              onAdd={(data) => {
                onAddAssets(data, cntc);
              }}
              onOpen={() => {
                onAddAssetPopOpen(cntc);
              }}
              onClose={() => {
                setSelCntcPrinAddAsst("");
              }}
            />
          </div>
        </div>
      </td>
      <td className="py-2">
        <div className="flex flex-row justify-center items-start gap-4 w-full">
          {cntc.principal === selContactPrin ? (
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
          {cntc.principal === selContactPrin ? (
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
      <td className="py-2">
        <div className="flex flex-row justify-center items-start gap-2 w-full">
          <ChevIcon
            onClick={() => {
              onChevIconClic(cntc);
            }}
            className={`w-8 h-8 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor stroke-0  cursor-pointer ${
              cntc.principal === openAssetsPrin ? "" : "rotate-90"
            }`}
          />
        </div>
      </td>
    </tr>
  );
  function onContactNameChange(e: ChangeEvent<HTMLInputElement>) {
    setContactEdited({ ...contactEdited, name: e.target.value });
    setContactEditedErr({ name: false, principal: contactEditedErr.principal });
  }
  function getFilteredAssets(cntc: Contact) {
    return assets.filter((ast) => {
      let isIncluded = false;
      cntc.assets.map((contAst) => {
        if (ast.tokenSymbol === contAst.tokenSymbol) isIncluded = true;
      });
      return !isIncluded;
    });
  }
  function onAddAssets(data: AssetToAdd[], cntc: Contact) {
    const auxAsst: AssetContact[] = data.map((dt) => {
      return {
        symbol: dt.symbol,
        tokenSymbol: dt.tokenSymbol,
        logo: dt.logo,
        subaccounts: [],
      };
    });
    addAsset(auxAsst, cntc.principal);
  }

  // Tailwind CSS
  function contactStyle(cntc: Contact) {
    return clsx({
      ["border-b border-BorderColorTwoLight dark:border-BorderColorTwo"]: true,
      ["bg-SelectRowColor/10"]: cntc.principal === selContactPrin || cntc.principal === selCntcPrinAddAsst,
      ["bg-SecondaryColorLight dark:bg-SecondaryColor"]:
        cntc.principal === openAssetsPrin && cntc.principal !== selContactPrin && cntc.principal !== selCntcPrinAddAsst,
    });
  }
};

export default ContactRow;
