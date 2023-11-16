// svgs
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as ChevIcon } from "@assets/svg/files/chev-icon.svg";
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { useTranslation } from "react-i18next";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { getInitialFromName, hexToNumber, hexToUint8Array, removeLeadingZeros, shortAddress } from "@/utils";
import { Principal } from "@dfinity/principal";
import { CustomCopy } from "@components/CopyTooltip";
import { CustomInput } from "@components/Input";
import {
  AssetContact,
  Contact,
  NewContactSubAccount,
  SubAccountContact,
  SubAccountContactErr,
} from "@redux/models/ContactsModels";
import { DeleteContactTypeEnum } from "@/const";
import { useContacts } from "../../hooks/contactsHook";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import bigInt from "big-integer";
import AddSubAccount from "./addSubAccount";
import SubAccountRow from "./subAccountRow";

interface TableSubAccountsProps {
  asst: AssetContact;
  addSub: boolean;
  selSubaccIdx: string;
  subaccEdited: SubAccountContact;
  subaccEditedErr: SubAccountContactErr;
  cntc: Contact;
  setSubaccEdited(value: SubAccountContact): void;
  changeSubIdx(value: string): void;
  changeName(value: string): void;
  setAddSub(value: boolean): void;
  setSelSubaccIdx(value: string): void;
  setSelContactPrin(value: string): void;
  setDeleteModal(value: boolean): void;
  setDeleteHpl(value: boolean): void;
  setDeleteType(value: DeleteContactTypeEnum): void;
  setSubaccEditedErr(value: SubAccountContactErr): void;
  setDeleteObject(value: NewContactSubAccount): void;
}

const TableSubAccounts = ({
  asst,
  addSub,
  selSubaccIdx,
  subaccEdited,
  subaccEditedErr,
  cntc,
  setSubaccEdited,
  changeSubIdx,
  changeName,
  setAddSub,
  setSelSubaccIdx,
  setSelContactPrin,
  setDeleteModal,
  setDeleteHpl,
  setDeleteType,
  setSubaccEditedErr,
  setDeleteObject,
}: TableSubAccountsProps) => {
  const { t } = useTranslation();

  const { asciiHex } = GeneralHook();
  const { checkSubIndxValid, editCntctSubacc, addCntctSubacc } = useContacts();

  return (
    <table className="w-full text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md ">
      {asst && (asst?.subaccounts?.length > 0 || addSub) && (
        <thead className="text-PrimaryTextColor/70">
          <tr className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">
            <th className="p-2 text-left w-[4.5%] "></th>
            <th className="p-2 text-left w-[5%] "></th>
            <th className="p-2 text-left w-[35%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo ">
              <p>{t("name")}</p>
            </th>
            <th className="p-2 w-[10%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo ">
              <p>{t("sub-acc")}</p>
            </th>
            <th className="p-2 w-[30%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo ">
              <p>{t("account.indentifier")}</p>
            </th>
            <th className="p-2 w-[12.5%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo "></th>
            <th className="w-[3%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo "></th>
          </tr>
        </thead>
      )}
      <tbody>
        {asst?.subaccounts?.map((sa, l) => {
          const encodedAcc = encodeIcrcAccount({
            owner: Principal.fromText(cntc.principal || ""),
            subaccount: hexToUint8Array(`0x${sa.subaccount_index}`),
          });
          return (
            <SubAccountRow
              l={l}
              sa={sa}
              cntc={cntc}
              asst={asst}
              encodedAcc={encodedAcc}
              selSubaccIdx={selSubaccIdx}
              subaccEdited={subaccEdited}
              subaccEditedErr={subaccEditedErr}
              changeName={changeName}
              changeSubIdx={changeSubIdx}
              onKeyDownIndex={onKeyDownIndex}
              checkSubAcc={checkSubAcc}
              onEdit={onEdit}
              onDelete={onDelete}
              setSelSubaccIdx={setSelSubaccIdx}
              key={l}
            />
          );
        })}
        {addSub && (
          <AddSubAccount
            asst={asst}
            subaccEdited={subaccEdited}
            subaccEditedErr={subaccEditedErr}
            cntc={cntc}
            changeName={changeName}
            changeSubIdx={changeSubIdx}
            onKeyDownIndex={onKeyDownIndex}
            setAddSub={setAddSub}
            setSelSubaccIdx={setSelSubaccIdx}
            checkSubAcc={checkSubAcc}
          />
        )}
      </tbody>
    </table>
  );

  function checkSubAcc(edit: boolean, cntc: Contact, asst: AssetContact, sa?: SubAccountContact) {
    let subacc = subaccEdited.subaccount_index.trim();
    if (subacc.slice(0, 2).toLowerCase() === "0x") subacc = subacc.substring(2);

    const checkedIdx = removeLeadingZeros(subacc) === "" ? "0" : removeLeadingZeros(subacc);
    const checkedIdxValid = checkSubIndxValid(checkedIdx, asst.subaccounts);

    let eqHexValid = false;
    let eqHex = false;
    if (edit) {
      eqHex = (hexToNumber(`0x${subacc}`) || bigInt()).eq(hexToNumber(`0x${sa?.subaccount_index}`) || bigInt());
      if (!eqHex) {
        eqHexValid = !checkedIdxValid;
      }
    } else {
      eqHexValid = !checkedIdxValid;
    }

    setSubaccEditedErr({
      name: subaccEdited.name.trim() === "",
      subaccount_index: subacc === "" || eqHexValid,
    });

    if (edit) {
      if (subacc !== "" && subaccEdited.name.trim() !== "" && (eqHex || checkedIdxValid)) {
        editCntctSubacc(cntc.principal, asst.tokenSymbol, sa?.subaccount_index || "0", subaccEdited.name, checkedIdx);
        setSelSubaccIdx("");
      }
    } else {
      if (subacc !== "" && subaccEdited.name.trim() !== "" && checkedIdxValid) {
        addCntctSubacc(
          cntc.principal,
          asst.tokenSymbol,
          subaccEdited.name,
          removeLeadingZeros(subacc) === "" ? "0" : removeLeadingZeros(subacc),
        );
        setSelSubaccIdx("");
        setAddSub(false);
      }
    }
  }

  function onKeyDownIndex(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!asciiHex.includes(e.key)) {
      e.preventDefault();
    }
    if (subaccEdited.subaccount_index.includes("0x") || subaccEdited.subaccount_index.includes("0X")) {
      if (e.key === "X" || e.key == "x") {
        e.preventDefault();
      }
    }
  }

  function onEdit(sa: SubAccountContact) {
    setAddSub(false);
    setSelContactPrin("");
    setSelSubaccIdx(sa.subaccount_index);
    setSubaccEdited(sa);
    setSubaccEditedErr({
      name: false,
      subaccount_index: false,
    });
  }

  function onDelete(sa: SubAccountContact) {
    setAddSub(false);
    setSelContactPrin("");
    setSelSubaccIdx("");
    setDeleteType(DeleteContactTypeEnum.Enum.SUB);
    setDeleteObject({
      principal: cntc.principal,
      name: cntc.name,
      tokenSymbol: asst.tokenSymbol,
      symbol: asst.symbol,
      subaccIdx: sa.subaccount_index,
      subaccName: sa.name,
      totalAssets: 0,
      TotalSub: 0,
    });
    setDeleteHpl(false);
    setDeleteModal(true);
  }
};

export default TableSubAccounts;
