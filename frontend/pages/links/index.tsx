import Menu from "@pages/components/Menu";
import DrawerVirtual from "@pages/home/components/HPL/DrawerVirtual";
import VirtualTable from "@pages/home/components/HPL/VirtualTable";
import { DrawerHook } from "@pages/home/hooks/drawerHook";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";

const ExchangeLinks = () => {
  const [selectedVirtualAccount, setSelectedVirtualAccount] = useState<string | null>(null);
  const { setDrawerOption, setDrawerOpen, drawerOpen } = DrawerHook();

  return (
    <Fragment>
      <div className="flex flex-col justify-start w-full h-full pt-6">
        <div className="flex flex-row justify-between items-center w-full ">
          <Menu />
        </div>
        <div className="flex px-3">
          <VirtualTable
            setSelectedVirtualAccount={setSelectedVirtualAccount}
            selectedVirtualAccount={selectedVirtualAccount}
            setDrawerOpen={setDrawerOpen}
            setDrawerOption={setDrawerOption}
            fullLinks={true}
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
