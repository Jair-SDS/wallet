import { Fragment, useEffect, useState } from "react";
import { DrawerOption, DrawerOptionEnum } from "@common/const";
import { useHPL } from "@pages/hooks/hplHook";
import { DrawerHook } from "@pages/home/hooks/drawerHook";
import HPLSubaccountAction from "./SubaccountActions";
import SubaccountInfo from "./SubaccountInfo";
import VirtualTable from "./VirtualTable";
import TransactionDrawer from "./TransactionDrawer";
import HPLDrawerReceive from "./HPLDrawerReceive";
import DrawerVirtual from "./DrawerVirtual";
import DrawerAction from "./DrawerAction";

const hplDrawerOptions = [{ name: "exchange.link", type: DrawerOptionEnum.Enum.HPL_QR, disabled: true }];

const SubaccountDetail = () => {
  const { selectSub } = useHPL(false);
  const { drawerOption, setDrawerOption, drawerOpen, setDrawerOpen } = DrawerHook();

  const [selectedVirtualAccount, setSelectedVirtualAccount] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVirtualAccount(null);
  }, [selectSub]);

  return (
    <Fragment>
      <div
        className={
          "relative flex flex-col justify-start items-center bg-SecondaryColorLight dark:bg-SecondaryColor w-full pt-6 pr-4 pl-7 gap-2 h-fit min-h-full"
        }
      >
        <HPLSubaccountAction
          onActionClick={handleActionClick}
          enableReceiveAction={selectedVirtualAccount ? true : false}
        />
        <SubaccountInfo onAddVirtualAccount={handleAddVirtualAccount}>
          <div className="w-full max-h-[calc(100vh-18rem)] scroll-y-light">
            <VirtualTable
              setSelectedVirtualAccount={setSelectedVirtualAccount}
              selectedVirtualAccount={selectedVirtualAccount}
              setDrawerOpen={setDrawerOpen}
              setDrawerOption={setDrawerOption}
            />
          </div>
        </SubaccountInfo>
      </div>
      <div
        id="right-drower"
        className={`h-full fixed z-[999] top-0 w-[28rem] overflow-x-hidden transition-{right} duration-500 ${
          drawerOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        {getDrawers()}
      </div>
    </Fragment>
  );

  function handleAddVirtualAccount() {
    setDrawerOpen(true);
    setDrawerOption(DrawerOptionEnum.Enum.ADD_VIRTUAL);
  }

  function handleActionClick(drawer: DrawerOption) {
    setDrawerOption(drawer);
    setTimeout(() => {
      setDrawerOpen(true);
    }, 150);
  }

  function getDrawers() {
    switch (drawerOption) {
      case DrawerOptionEnum.Enum.SEND:
      case DrawerOptionEnum.Enum.RECEIVE:
        return (
          <TransactionDrawer
            setDrawerOpen={setDrawerOpen}
            drawerOption={drawerOption}
            drawerOpen={drawerOpen}
            locat="detail"
          />
        );
      case DrawerOptionEnum.Enum.HPL_QR:
        return (
          <div className="flex flex-col items-center justify-start w-full h-full gap-5 px-6 pt-8 bg-PrimaryColorLight dark:bg-PrimaryColor">
            <DrawerAction
              options={hplDrawerOptions}
              drawerOption={drawerOption}
              setDrawerOption={setDrawerOption}
              setDrawerOpen={setDrawerOpen}
            >
              <HPLDrawerReceive virtualAccount={selectedVirtualAccount} />
            </DrawerAction>
          </div>
        );
      case DrawerOptionEnum.Enum.ADD_VIRTUAL:
      case DrawerOptionEnum.Enum.EDIT_VIRTUAL:
        return <DrawerVirtual setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />;
    }
  }
};

export default SubaccountDetail;
