import { useTranslation } from "react-i18next";
import { Contact, NewContactSubAccount, SubAccountContact, SubAccountContactErr } from "@redux/models/ContactsModels";
import { AccountIdentifier } from "@dfinity/nns";
import TableAssets from "./tableAssets";
import { Fragment } from "react";
import { DeleteContactTypeEnum } from "@/const";
import { Principal } from "@dfinity/principal";
import { useContacts } from "../../hooks/contactsHook";
import ContactRow from "./contactRow";

interface TableContactsProps {
  changeName(value: string): void;
  setDeleteType(value: DeleteContactTypeEnum): void;
  setDeleteObject(value: NewContactSubAccount): void;
  setSubaccEdited(value: SubAccountContact): void;
  setSubaccEditedErr(value: SubAccountContactErr): void;
  changeSubIdx(value: string): void;
  setDeleteModal(value: boolean): void;
  setDeleteHpl(value: boolean): void;
  subaccEdited: SubAccountContact;
  subaccEditedErr: SubAccountContactErr;
  searchKey: string;
  assetFilter: string[];
}

const TableContacts = ({
  changeName,
  setDeleteType,
  setDeleteObject,
  setSubaccEdited,
  setSubaccEditedErr,
  changeSubIdx,
  setDeleteModal,
  setDeleteHpl,
  subaccEdited,
  subaccEditedErr,
  searchKey,
  assetFilter,
}: TableContactsProps) => {
  const { t } = useTranslation();
  const {
    contacts,
    selContactPrin,
    setSelContactPrin,
    checkPrincipalValid,
    updateContact,
    selCntcPrinAddAsst,
    setSelCntcPrinAddAsst,
    contactEdited,
    setContactEdited,
    openSubaccToken,
    setOpenSubaccToken,
    openAssetsPrin,
    setOpenAssetsPrin,
    selSubaccIdx,
    setSelSubaccIdx,
    contactEditedErr,
    setContactEditedErr,
    addSub,
    setAddSub,
  } = useContacts();

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
            <p>{t("assets")}</p>
          </th>
          <th className="p-2 w-[12%] bg-PrimaryColorLight dark:bg-PrimaryColor">
            <p>{t("action")}</p>
          </th>
          <th className="w-[3%] bg-PrimaryColorLight dark:bg-PrimaryColor"></th>
        </tr>
      </thead>
      <tbody>
        {getContactsToShow().map((cntc, k) => (
          <Fragment key={k}>
            <ContactRow
              cntc={cntc}
              k={k}
              selContactPrin={selContactPrin}
              openAssetsPrin={openAssetsPrin}
              selCntcPrinAddAsst={selCntcPrinAddAsst}
              contactEditedErr={contactEditedErr}
              contactEdited={contactEdited}
              setContactEdited={setContactEdited}
              setContactEditedErr={setContactEditedErr}
              onAddAssetPopOpen={onAddAssetPopOpen}
              setSelCntcPrinAddAsst={setSelCntcPrinAddAsst}
              onSave={onSave}
              onEdit={onEdit}
              onClose={onClose}
              onDelete={onDelete}
              onChevIconClic={onChevIconClic}
            />
            {cntc.principal === openAssetsPrin && (
              <tr className="bg-SecondaryColorLight dark:bg-SecondaryColor">
                <td colSpan={5} className="w-full h-4 border-BorderColorTwoLight dark:border-BorderColorTwo">
                  <TableAssets
                    cntc={cntc}
                    openSubaccToken={openSubaccToken}
                    setOpenSubaccToken={setOpenSubaccToken}
                    setSelSubaccIdx={setSelSubaccIdx}
                    changeName={changeName}
                    addSub={addSub}
                    setAddSub={setAddSub}
                    setDeleteType={setDeleteType}
                    setDeleteObject={setDeleteObject}
                    setSelContactPrin={setSelContactPrin}
                    setSubaccEdited={setSubaccEdited}
                    setSubaccEditedErr={setSubaccEditedErr}
                    changeSubIdx={changeSubIdx}
                    setDeleteModal={setDeleteModal}
                    setDeleteHpl={setDeleteHpl}
                    selSubaccIdx={selSubaccIdx}
                    subaccEdited={subaccEdited}
                    subaccEditedErr={subaccEditedErr}
                  ></TableAssets>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );

  function getContactsToShow() {
    return contacts.filter((cntc) => {
      let incSubName = false;
      for (let i = 0; i < cntc.assets.length; i++) {
        const ast = cntc.assets[i];
        for (let j = 0; j < ast.subaccounts.length; j++) {
          const sa = ast.subaccounts[j];
          if (sa.name.toLowerCase().includes(searchKey.toLowerCase())) {
            incSubName = true;
            break;
          }
        }
      }
      if (assetFilter.length === 0) {
        return (
          cntc.name.toLowerCase().includes(searchKey.toLowerCase()) ||
          incSubName ||
          cntc.principal.toLowerCase().includes(searchKey.toLowerCase())
        );
      } else {
        const astFilValid = assetFilter.some((astFil) => {
          return cntc.assets.find((ast) => ast.tokenSymbol === astFil);
        });

        return (
          (cntc.name.toLowerCase().includes(searchKey.toLowerCase()) ||
            incSubName ||
            cntc.principal.toLowerCase().includes(searchKey.toLowerCase())) &&
          astFilValid
        );
      }
    });
  }
  function onAddAssetPopOpen(cntc: Contact) {
    setSelCntcPrinAddAsst(cntc.principal);
    setAddSub(false);
    setSelSubaccIdx("");
    setSelContactPrin("");
  }
  function onSave(cntc: Contact) {
    setContactEditedErr({
      name: contactEdited.name.trim() === "",
      principal: contactEdited.principal !== cntc.principal && !checkPrincipalValid(contactEdited.principal),
    });

    if (
      contactEdited.name.trim() !== "" &&
      (checkPrincipalValid(contactEdited.principal) || contactEdited.principal === cntc.principal)
    ) {
      updateContact(
        {
          ...contactEdited,
          assets: cntc.assets,
          accountIdentier: AccountIdentifier.fromPrincipal({
            principal: Principal.fromText(contactEdited.principal),
          }).toHex(),
        },
        cntc.principal,
      );
      setSelContactPrin("");
    }
  }
  function onEdit(cntc: Contact) {
    setAddSub(false);
    setSelSubaccIdx("");
    setSelContactPrin(cntc.principal);
    setContactEdited(cntc);
    if (cntc.principal !== openAssetsPrin) {
      setOpenAssetsPrin("");
    }
    setContactEditedErr({ name: false, principal: false });
  }
  function onClose() {
    setSelContactPrin("");
    setSubaccEditedErr({ name: false, subaccount_index: false });
  }
  function onDelete(cntc: Contact) {
    setAddSub(false);
    setSelContactPrin("");
    setSelSubaccIdx("");
    setDeleteType(DeleteContactTypeEnum.Enum.CONTACT);
    let ttlSub = 0;
    cntc.assets.map((asst) => {
      ttlSub = ttlSub + asst.subaccounts.length;
    });
    setDeleteObject({
      principal: cntc.principal,
      name: cntc.name,
      tokenSymbol: "",
      symbol: "",
      subaccIdx: "",
      subaccName: "",
      totalAssets: cntc.assets.length,
      TotalSub: ttlSub,
    });
    setDeleteHpl(false);
    setDeleteModal(true);
  }
  function onChevIconClic(cntc: Contact) {
    if (cntc.principal === openAssetsPrin) setOpenAssetsPrin("");
    else {
      if (cntc.assets.length > 0) {
        setContactEdited(cntc);
        setOpenAssetsPrin(cntc.principal);
      }
    }
    if (cntc.principal !== selContactPrin) setSelContactPrin("");
    setOpenSubaccToken("");
    setSelSubaccIdx("");
    setAddSub(false);
  }
};

export default TableContacts;
