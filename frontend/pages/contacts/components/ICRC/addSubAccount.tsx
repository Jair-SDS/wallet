// svgs
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { ReactComponent as ChevIcon } from "@assets/svg/files/chev-icon.svg";
//
import { hexToUint8Array, shortAddress } from "@/utils";
import { CustomCopy } from "@components/CopyTooltip";
import { CustomInput } from "@components/Input";
import { AssetContact, Contact, SubAccountContact, SubAccountContactErr } from "@redux/models/ContactsModels";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";

interface AddSubAccountProps {
  asst: AssetContact;
  subaccEdited: SubAccountContact;
  subaccEditedErr: SubAccountContactErr;
  cntc: Contact;
  changeName(value: string): void;
  changeSubIdx(value: string): void;
  onKeyDownIndex(e: React.KeyboardEvent<HTMLInputElement>): void;
  setAddSub(value: boolean): void;
  setSelSubaccIdx(value: string): void;
  checkSubAcc(edit: boolean, cntc: Contact, asst: AssetContact, sa?: SubAccountContact): void;
}

const AddSubAccount = ({
  asst,
  subaccEdited,
  subaccEditedErr,
  cntc,
  changeName,
  changeSubIdx,
  onKeyDownIndex,
  setAddSub,
  setSelSubaccIdx,
  checkSubAcc,
}: AddSubAccountProps) => {
  return (
    <tr>
      <td></td>
      <td className="h-full">
        <div className="relative flex flex-col justify-center items-center w-full h-full">
          <div className="w-1 h-1 bg-SelectRowColor"></div>
          <div className="absolute bottom-0 w-1 ml-[-1px] left-1/2 border-l h-14 border-dotted border-SelectRowColor"></div>
        </div>
      </td>
      <td className={"py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SelectRowColor/10"}>
        <div className="relative flex flex-row justify-start items-center w-full h-10 gap-2 px-4">
          <CustomInput
            intent={"primary"}
            border={subaccEditedErr.name ? "error" : "selected"}
            sizeComp={"xLarge"}
            sizeInput="small"
            value={subaccEdited.name}
            onChange={(e) => {
              changeName(e.target.value);
            }}
            autoFocus
          />
        </div>
      </td>
      <td className={"py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SelectRowColor/10"}>
        <div className="relative flex flex-row justify-start items-center w-full h-10 gap-2 px-4">
          <CustomInput
            intent={"primary"}
            border={subaccEditedErr.subaccount_index ? "error" : "selected"}
            sizeComp={"xLarge"}
            sizeInput="small"
            inputClass="text-center"
            value={subaccEdited.subaccount_index}
            onChange={(e) => {
              changeSubIdx(e.target.value);
            }}
            onKeyDown={onKeyDownIndex}
          />
        </div>
      </td>
      <td className={"py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SelectRowColor/10"}>
        <div className="flex flex-row justify-center items-center gap-2 opacity-70 px-2 w-full">
          <p>{shortAddress(getSubAcc(cntc.principal), 12, 10)}</p>
          <CustomCopy size={"xSmall"} className="p-0" copyText={getSubAcc(cntc.principal)} />
        </div>
      </td>
      <td className={"py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SelectRowColor/10"}>
        <div className="flex flex-row justify-center items-start gap-4 w-full">
          <CheckIcon
            onClick={() => {
              checkSubAcc(false, cntc, asst || ({} as AssetContact));
            }}
            className="w-4 h-4 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor opacity-50 cursor-pointer"
          />
          <CloseIcon
            onClick={onCloseClic}
            className="w-5 h-5 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor opacity-50 cursor-pointer"
          />
        </div>
      </td>
      <td className={"py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SelectRowColor/10"}>
        <div className="flex flex-row justify-center items-start gap-2 w-full">
          <ChevIcon className="invisible" />
        </div>
      </td>
    </tr>
  );
  function onCloseClic() {
    setAddSub(false);
    setSelSubaccIdx("");
  }
  function getSubAcc(princ: string) {
    return encodeIcrcAccount({
      owner: Principal.fromText(princ || ""),
      subaccount: hexToUint8Array(`0x${subaccEdited.subaccount_index}` || "0"),
    });
  }
};

export default AddSubAccount;
