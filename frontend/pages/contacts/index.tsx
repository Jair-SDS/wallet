import { Fragment } from "react";
import Menu from "@pages/components/Menu";
import ContactFilters from "./components/contactFilters";
import ContactList from "./components/contactList";
import useContactFilters from "./hooks/useContactFilters";

const Contacts = () => {
  const {
    assetOpen,
    addOpen,
    searchKey,
    assetFilter,
    setAssetOpen,
    setAddOpen,
    setSearchKey,
    setAssetFilter,
    edit,
    setEdit,
  } = useContactFilters();

  return (
    <Fragment>
      <div className="flex flex-col w-full h-full pt-6 px-9">
        <Menu />
        <div className="flex flex-col items-start justify-start w-full h-full">
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
      </div>
    </Fragment>
  );
};

export default Contacts;
