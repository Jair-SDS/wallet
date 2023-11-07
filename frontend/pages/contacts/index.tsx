import { Fragment, useState } from "react";
import Menu from "@pages/components/Menu";
import ContactFilters from "./components/contactFilters";
import { useContacts } from "./hooks/contactsHook";
import ContactList from "./components/contactList";
import { HplContact } from "@redux/models/AccountModels";

const Contacts = () => {
  const { searchKey, setSearchKey, assetFilter, setAssetFilter, setAddOpen, addOpen } = useContacts();
  const [edit, setEdit] = useState<HplContact>();
  return (
    <Fragment>
      <div className="flex flex-col w-full h-full pt-6">
        <Menu />
        <div className="flex flex-col justify-start items-start w-full h-full px-4">
          <ContactFilters
            searchKey={searchKey}
            assetFilter={assetFilter}
            setSearchKey={setSearchKey}
            setAssetFilter={setAssetFilter}
            edit={edit}
            setEdit={setEdit}
            setAddOpen={setAddOpen}
            addOpen={addOpen}
          />
          <ContactList searchKey={searchKey} assetFilter={assetFilter} setAddOpen={setAddOpen} setEdit={setEdit} />
        </div>
      </div>
    </Fragment>
  );
};

export default Contacts;
