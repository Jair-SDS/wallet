// svgs
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as ChevIcon } from "@assets/svg/files/chev-icon.svg";
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { getInitialFromName, shortAddress } from "@/utils";
import { CustomCopy } from "@components/CopyTooltip";
import { CustomInput } from "@components/Input";
import { AssetContact, Contact, SubAccountContact, SubAccountContactErr } from "@redux/models/ContactsModels";

interface SubAccountRowProps {
  l: number;
  sa: SubAccountContact;
  cntc: Contact;
  asst: AssetContact;
  encodedAcc: string;
  selSubaccIdx: string;
  subaccEdited: SubAccountContact;
  subaccEditedErr: SubAccountContactErr;
  changeName(value: string): void;
  changeSubIdx(value: string): void;
  onKeyDownIndex(e: React.KeyboardEvent<HTMLInputElement>): void;
  checkSubAcc(edit: boolean, cntc: Contact, asst: AssetContact, sa?: SubAccountContact): void;
  onEdit(sa: SubAccountContact): void;
  onDelete(sa: SubAccountContact): void;
  setSelSubaccIdx(value: string): void;
}

const SubAccountRow = ({
  l,
  sa,
  cntc,
  asst,
  encodedAcc,
  selSubaccIdx,
  subaccEdited,
  subaccEditedErr,
  changeName,
  changeSubIdx,
  onKeyDownIndex,
  checkSubAcc,
  onEdit,
  onDelete,
  setSelSubaccIdx,
}: SubAccountRowProps) => {
  return (
    <tr key={l}>
      <td></td>
      <td className="h-full">
        <div className="relative flex flex-col justify-center items-center w-full h-full">
          <div className="w-1 h-1 bg-SelectRowColor"></div>
          {l !== 0 && (
            <div className="absolute bottom-0 w-1 ml-[-1px] left-1/2 border-l h-14 border-dotted border-SelectRowColor"></div>
          )}
        </div>
      </td>
      <td
        className={`py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo ${
          sa.subaccount_index === selSubaccIdx ? "bg-SelectRowColor/10" : ""
        }`}
      >
        <div className="relative flex flex-row justify-start items-center w-full h-10 gap-2 px-4">
          {sa.subaccount_index === selSubaccIdx ? (
            <CustomInput
              intent={"primary"}
              border={subaccEditedErr.name ? "error" : "selected"}
              sizeComp={"xLarge"}
              sizeInput="small"
              value={subaccEdited.name}
              onChange={(e) => {
                changeName(e.target.value);
              }}
            />
          ) : (
            <div className="flex flex-row justify-start items-center w-full gap-2">
              <div
                className={
                  "flex justify-center items-center w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-md bg-SelectRowColor"
                }
              >
                <p className="text-PrimaryTextColor">{getInitialFromName(sa.name, 1)}</p>
              </div>
              <p className="opacity-70 break-all text-left">
                {sa.name.length > 105 ? `${sa.name.slice(0, 105)}...` : sa.name}
              </p>
            </div>
          )}
        </div>
      </td>
      <td
        className={`py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo ${
          sa.subaccount_index === selSubaccIdx ? "bg-SelectRowColor/10" : ""
        }`}
      >
        <div className="relative flex flex-row justify-start items-center w-full h-10 gap-2 px-4">
          {sa.subaccount_index === selSubaccIdx ? (
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
          ) : (
            <div className="flex flex-row justify-center items-center gap-2 opacity-70 px-2 w-full">
              <p className=" whitespace-nowrap">{`0x${sa.subaccount_index || "0"}`}</p>
              <CustomCopy size={"xSmall"} className="p-0" copyText={sa.subaccount_index || "0"} />
            </div>
          )}
        </div>
      </td>
      <td
        className={`py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo ${
          sa.subaccount_index === selSubaccIdx ? "bg-SelectRowColor/10" : ""
        }`}
      >
        <div className="flex flex-row justify-center items-center gap-2 opacity-70 px-2 w-full">
          <p>{shortAddress(encodedAcc, 12, 10)}</p>
          <CustomCopy size={"xSmall"} className="p-0" copyText={encodedAcc} />
        </div>
      </td>
      <td
        className={`py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo ${
          sa.subaccount_index === selSubaccIdx ? "bg-SelectRowColor/10" : ""
        }`}
      >
        <div className="flex flex-row justify-center items-start gap-4 w-full">
          {sa.subaccount_index === selSubaccIdx ? (
            <CheckIcon
              onClick={() => {
                checkSubAcc(true, cntc, asst, sa);
              }}
              className="w-4 h-4 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor opacity-50 cursor-pointer"
            />
          ) : (
            <PencilIcon
              onClick={() => {
                onEdit(sa);
              }}
              className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor opacity-50 cursor-pointer"
            />
          )}
          {sa.subaccount_index === selSubaccIdx ? (
            <CloseIcon
              onClick={() => {
                setSelSubaccIdx("");
              }}
              className="w-5 h-5 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor opacity-50 cursor-pointer"
            />
          ) : (
            <TrashIcon
              onClick={() => {
                onDelete(sa);
              }}
              className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor cursor-pointer"
            />
          )}
        </div>
      </td>
      <td
        className={`py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo ${
          sa.subaccount_index === selSubaccIdx ? "bg-SelectRowColor/10" : ""
        }`}
      >
        <div className="flex flex-row justify-center items-start gap-2 w-full">
          <ChevIcon className="invisible" />
        </div>
      </td>
    </tr>
  );
};

export default SubAccountRow;
