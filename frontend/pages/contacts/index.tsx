import Menu from "@pages/components/Menu";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import useContactFilters from "./hooks/useContactFilters";
import { BasicModal } from "@components/modal";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { ProtocolTypeEnum } from "@common/const";
import AddEditHplContact from "./components/HPL/addHplContact";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import AssetFilter from "./components/ICRC/AssetFilter";
import { CustomInput } from "@components/input";
import AddContactModal from "./components/ICRC/AddContactModal";
import Switch from "@components/switch/BasicSwitch";
import HplContactList from "./components/HPL/hplContactList";
import ContactList from "./components/ContactList";
import ContactFilters from "./components/HPL/contactFilters";

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
  const { t } = useTranslation();
  const [allowanceOnly, setAllowanceOnly] = useState(false);
  const [contactSearchKey, setContactSearchKey] = useState("");

  const onContactSearchKeyChange = useCallback((searchKey: string) => {
    setContactSearchKey(searchKey);
  }, []);

  const onAssetFilterChange = useCallback((assetFilter: string[]) => {
    setAssetFilter(assetFilter);
  }, []);

  return (
    <div className="flex flex-col w-full h-full pt-6 px-3">
      <Menu />
      {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
        <div className="flex flex-col items-start justify-start w-full gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center w-10/12 gap-3 text-md">
              <AssetFilter assetFilter={assetFilter} onAssetFilterChange={onAssetFilterChange} />

              <CustomInput
                compOutClass="!w-[40%]"
                prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
                intent={"secondary"}
                sizeInput={"medium"}
                placeholder={t("search.contact")}
                value={contactSearchKey}
                onChange={(e) => onContactSearchKeyChange(e.target.value)}
              />

              <AddContactModal />
            </div>
            <div className="flex items-center justify-end w-2/12">
              <p className="mr-2 place-self-end text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor">
                {t("allowances.only")}
              </p>
              <Switch checked={allowanceOnly} onChange={() => setAllowanceOnly(!allowanceOnly)} />
            </div>
          </div>
          <ContactList contactSearchKey={contactSearchKey} assetFilter={assetFilter} allowanceOnly={allowanceOnly} />
        </div>
      ) : (
        <div className="flex flex-col items-start justify-start w-full h-full ">
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
          <HplContactList searchKey={searchKey} assetFilter={assetFilter} setAddOpen={setAddOpen} setEdit={setEdit} />
          <BasicModal
            open={addOpen}
            width="w-[48rem]"
            padding="py-5 px-8"
            border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
          >
            <AddEditHplContact edit={edit} setAddOpen={setAddOpen} />
          </BasicModal>
        </div>
      )}
    </div>
  );
};

export default Contacts;
