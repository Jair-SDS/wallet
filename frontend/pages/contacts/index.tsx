import Menu from "@pages/components/Menu";
import useContactFilters from "./hooks/useContactFilters";
import ContactFilters from "./components/contactFilters";
import Modal from "@components/Modal";
import AddContact from "./components/ICRC/AddContact";
import ContactList from "./components/contactList";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { ProtocolTypeEnum } from "@/const";
import AddEditHplContact from "./components/HPL/addHplContact";

const Contacts = () => {
  const { protocol } = GeneralHook();
  const {
    assetOpen,
    addOpen,
    searchKey,
    assetFilter,
    edit,
    setAssetOpen,
    setAddOpen,
    setSearchKey,
    setAssetFilter,
    setEdit,
  } = useContactFilters();

  return (
    <div className="flex flex-col w-full h-full pt-6">
      <Menu />
      <div className="flex flex-col items-start justify-start w-full h-full px-3">
        <ContactFilters
          assetOpen={assetOpen}
          addOpen={addOpen}
          searchKey={searchKey}
          assetFilter={assetFilter}
          setAssetOpen={setAssetOpen}
          setAddOpen={setAddOpen}
          setSearchKey={setSearchKey}
          setAssetFilter={setAssetFilter}
          edit={edit}
          setEdit={setEdit}
        />
        <ContactList searchKey={searchKey} assetFilter={assetFilter} setAddOpen={setAddOpen} setEdit={setEdit} />
      </div>
      <Modal
        open={addOpen}
        width="w-[48rem]"
        padding="py-5 px-8"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
      >
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
          <AddContact setAddOpen={setAddOpen} />
        ) : (
          <AddEditHplContact edit={edit} setAddOpen={setAddOpen} />
        )}
      </Modal>
    </div>
  );
};

export default Contacts;
