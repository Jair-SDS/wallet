import Menu from "@pages/components/Menu";
import DrawerVirtual from "@pages/home/components/HPL/DrawerVirtual";
import VirtualTable from "@pages/home/components/HPL/VirtualTable";
import { DrawerHook } from "@pages/home/hooks/drawerHook";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import ExchangeLinksFilters from "./components/LinksFilters";

const ExchangeLinks = () => {
  const [selectedVirtualAccount, setSelectedVirtualAccount] = useState<string | null>(null);
  const { setDrawerOption, setDrawerOpen, drawerOpen } = DrawerHook();
  const [assetFilter, setAssetFilter] = useState<string[]>([]);
  const [searchKey, setSearchKey] = useState("");

  return (
    <Fragment>
      <div className="flex flex-col justify-start w-full h-full pt-6">
        <div className="flex flex-row justify-between items-center w-full mb-2 pr-3">
          <Menu noMargin={true} />
          <ExchangeLinksFilters
            assetFilter={assetFilter}
            setAssetFilter={setAssetFilter}
            searchKey={searchKey}
            setSearchKey={setSearchKey}
            setDrawerOpen={setDrawerOpen}
          />
        </div>
        <div className="flex px-3">
          <VirtualTable
            setSelectedVirtualAccount={setSelectedVirtualAccount}
            selectedVirtualAccount={selectedVirtualAccount}
            setDrawerOpen={setDrawerOpen}
            setDrawerOption={setDrawerOption}
            fullLinks={{ filter: assetFilter, searchKey: searchKey }}
          />
        </div>
      </div>
      <div
        id="right-drower"
        className={`h-full fixed z-[999] top-0 w-[28rem] overflow-x-hidden transition-{right} duration-500 ${
          drawerOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        <DrawerVirtual setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />
      </div>
    </Fragment>
  );
};
export default ExchangeLinks;
