import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { checkHexString } from "@/utils";
import { DeleteContactTypeEnum, ProtocolTypeEnum } from "@/const";
import RemoveModal from "./removeModal";
import TableContacts from "./ICRC/tableContacts";
import TableHplContacts from "./HPL/tableHplContacts";
import useContactTable from "../hooks/useContactTable";
import { HplContact } from "@redux/models/AccountModels";

interface ContactListProps {
  searchKey: string;
  assetFilter: string[];
  setAddOpen(value: boolean): void;
  setEdit(value: HplContact | undefined): void;
}

const ContactList = ({ searchKey, assetFilter, setAddOpen, setEdit }: ContactListProps) => {
  const { t } = useTranslation();
  const {
    protocol,
    subaccEdited,
    setSubaccEdited,
    deleteModal,
    setDeleteModal,
    deleteType,
    setDeleteType,
    deleteObject,
    setDeleteObject,
    subaccEditedErr,
    setSubaccEditedErr,
    deleteHpl,
    setDeleteHpl,
  } = useContactTable();

  return (
    <Fragment>
      <div className="flex flex-col w-full h-full mt-3 scroll-y-light max-h-[calc(100vh-12rem)]">
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
          <TableContacts
            changeName={changeName}
            setDeleteType={setDeleteType}
            setDeleteObject={setDeleteObject}
            setSubaccEdited={setSubaccEdited}
            setSubaccEditedErr={setSubaccEditedErr}
            changeSubIdx={changeSubIdx}
            setDeleteModal={setDeleteModal}
            setDeleteHpl={setDeleteHpl}
            subaccEdited={subaccEdited}
            subaccEditedErr={subaccEditedErr}
            searchKey={searchKey}
            assetFilter={assetFilter}
          ></TableContacts>
        ) : (
          <TableHplContacts
            setAddOpen={setAddOpen}
            setEdit={setEdit}
            setDeleteType={setDeleteType}
            setDeleteHpl={setDeleteHpl}
            setDeleteModal={setDeleteModal}
            setDeleteObject={setDeleteObject}
            searchKey={searchKey}
            assetFilter={assetFilter}
          />
        )}
      </div>
      <RemoveModal
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        deleteHpl={deleteHpl}
        deleteType={deleteType}
        getDeleteMsg={getDeleteMsg}
        deleteObject={deleteObject}
      />
    </Fragment>
  );
  function changeSubIdx(e: string) {
    if (checkHexString(e)) {
      setSubaccEdited((prev) => {
        return { ...prev, subaccount_index: e.trim(), sub_account_id: `0x${e.trim()}` };
      });
      setSubaccEditedErr((prev) => {
        return {
          name: prev.name,
          subaccount_index: false,
        };
      });
    }
  }
  function changeName(e: string) {
    setSubaccEdited((prev) => {
      const newSubAccount = { ...prev, name: e };
      return newSubAccount;
    });
    setSubaccEditedErr((prev) => {
      return {
        name: false,
        subaccount_index: prev.subaccount_index,
      };
    });
  }

  function getDeleteMsg() {
    let msg1 = "";
    let msg2 = "";

    switch (deleteType) {
      case DeleteContactTypeEnum.Enum.CONTACT:
        msg1 = deleteHpl
          ? t("delete.contact.contact.hpl.msg")
          : t("delete.contact.contact.msg", { name: deleteObject.name });
        msg2 = deleteObject.name;
        break;
      case DeleteContactTypeEnum.Enum.ASSET:
        msg1 = t("delete.contact.asset.msg", { symbol: deleteObject.symbol });
        msg2 = deleteObject.symbol;
        break;
      case DeleteContactTypeEnum.Enum.SUB:
        msg1 = deleteHpl
          ? t("delete.contact.remote.hpl.msg")
          : t("delete.contact.sub.msg", { name: deleteObject.subaccName });
        msg2 = deleteObject.subaccName;
        break;
      default:
        msg1 = t("delete.contact.contact.msg", { name: deleteObject.name });
        msg2 = deleteObject.name;
        break;
        break;
    }
    return { msg1: msg1, msg2: msg2 };
  }
};

export default ContactList;
