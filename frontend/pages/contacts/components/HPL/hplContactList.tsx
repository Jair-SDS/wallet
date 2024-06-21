import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { DeleteContactTypeEnum } from "@/common/const";
import { HplContact } from "@redux/models/AccountModels";
import TableHplContacts from "./tableHplContacts";
import RemoveModal from "./removeModal";
import useContactTable from "@pages/contacts/hooks/useContactTable";

interface HplContactListProps {
  searchKey: string;
  assetFilter: string[];
  setAddOpen(value: boolean): void;
  setEdit(value: HplContact | undefined): void;
}

const HplContactList = ({ searchKey, assetFilter, setAddOpen, setEdit }: HplContactListProps) => {
  const { t } = useTranslation();
  const {
    deleteModal,
    setDeleteModal,
    deleteType,
    setDeleteType,
    deleteObject,
    setDeleteObject,
    deleteHpl,
    setDeleteHpl,
  } = useContactTable();

  return (
    <Fragment>
      <div className="flex flex-col w-full h-full mt-3 scroll-y-light max-h-[calc(100vh-14rem)]">
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
    }
    return { msg1: msg1, msg2: msg2 };
  }
};

export default HplContactList;
