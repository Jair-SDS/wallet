import { useState } from "react";
import DrawerSend from "./ICRC/DrawerSend";
import DrawerWrap from "./ICRC/DrawerWrap";
import DrawerAction from "./ICRC/DrawerAction";
import DrawerTransaction from "./ICRC/Transaction";
import { DrawerHook } from "../hooks/drawerHook";
import { UseTransaction } from "../hooks/useTransaction";
import { DrawerOption, DrawerOptionEnum, ProtocolType, ProtocolTypeEnum } from "@/const";
import ICRCSubaccountAction from "./ICRC/SubaccountAction";
import ICRCTransactionsTable from "./ICRC/TransactionsTable";
import HPLSubaccountAction from "./HPL/SubaccountActions";
import { AssetHook } from "../hooks/assetHook";
import SubaccountInfo from "./HPL/SubaccountInfo";
import DrawerVirtual from "./HPL/DrawerVirtual";
import TransactionDrawer from "./HPL/TransactionDrawer";
import VirtualTable from "./HPL/VirtualTable";
import DrawerReceive from "./ICRC/DrawerReceive";
import HPLDrawerReceive from "./HPL/HPLDrawerReceive";

const icrc1DrawerOptions = [
  { name: "send", type: DrawerOptionEnum.Enum.SEND },
  { name: "receive", type: DrawerOptionEnum.Enum.RECEIVE },
];

const hplDrawerOptions = [{ name: "receive", type: DrawerOptionEnum.Enum.HPL_QR, disabled: true }];

const DetailList = () => {
  const { protocol } = AssetHook();
  const { drawerOption, setDrawerOption, drawerOpen, setDrawerOpen } = DrawerHook();
  const { selectedTransaction } = UseTransaction();

  const [selectedVirtualAccount, setSelectedVirtualAccount] = useState<string | null>(null);
  const enableReceiveAction = selectedVirtualAccount !== null;

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

  const getDrawers = (option: ProtocolType) => {
    switch (option) {
      case "ICRC1":
        return selectedTransaction ? (
          <DrawerTransaction setDrawerOpen={setDrawerOpen} />
        ) : (
          <div className="flex flex-col justify-start items-center bg-PrimaryColorLight dark:bg-PrimaryColor gap-5 w-full h-full pt-8 px-6">
            <DrawerAction
              options={icrc1DrawerOptions}
              drawerOption={drawerOption}
              setDrawerOption={setDrawerOption}
              setDrawerOpen={setDrawerOpen}
            >
              {drawerOption === DrawerOptionEnum.Enum.SEND && (
                <DrawerSend drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
              )}
              {drawerOption === DrawerOptionEnum.Enum.RECEIVE && <DrawerReceive />}
              {drawerOption === DrawerOptionEnum.Enum.WRAP && <DrawerWrap />}
            </DrawerAction>
          </div>
        );
      default:
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
              <div className="flex flex-col justify-start items-center bg-PrimaryColorLight dark:bg-PrimaryColor gap-5 w-full h-full pt-8 px-6">
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

  return (
    <>
      <div
        className={
          "relative flex flex-col justify-start items-center bg-SecondaryColorLight dark:bg-SecondaryColor w-full pt-6 pr-4 pl-7 gap-2 h-fit min-h-full"
        }
      >
        <div className="flex flex-row justify-between items-center w-full h-[4.75rem] bg-TransactionHeaderColorLight dark:bg-TransactionHeaderColor rounded-md">
          {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
            <ICRCSubaccountAction onActionClick={handleActionClick} />
          ) : (
            <HPLSubaccountAction onActionClick={handleActionClick} enableReceiveAction={enableReceiveAction} />
          )}
        </div>

        <div className="w-full max-h-[calc(100vh-11.25rem)] scroll-y-light">
          {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
            <ICRCTransactionsTable setDrawerOpen={setDrawerOpen} />
          ) : (
            <SubaccountInfo onAddVirtualAccount={handleAddVirtualAccount}>
              <VirtualTable
                setSelectedVirtualAccount={setSelectedVirtualAccount}
                selectedVirtualAccount={selectedVirtualAccount}
                setDrawerOpen={setDrawerOpen}
                setDrawerOption={setDrawerOption}
              />
            </SubaccountInfo>
          )}
        </div>
      </div>
      <div
        id="right-drower"
        className={`h-[calc(100%-4.5rem)] fixed z-[999] top-4.5rem w-[28rem] overflow-x-hidden transition-{right} duration-500 ${
          drawerOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        {getDrawers(protocol)}
      </div>
    </>
  );
};

export default DetailList;
