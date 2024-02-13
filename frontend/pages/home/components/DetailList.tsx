import { useEffect, useState } from "react";
import { DrawerHook } from "../hooks/drawerHook";
import { UseTransaction } from "../hooks/useTransaction";
import {
  DrawerOption,
  DrawerOptionEnum,
  ICRCSubaccountInfo,
  ICRCSubaccountInfoEnum,
  ProtocolType,
  ProtocolTypeEnum,
} from "@/const";
import ICRCSubaccountAction from "./ICRC/SubaccountAction";
import { AssetHook } from "../hooks/assetHook";
import SubaccountInfo from "./HPL/SubaccountInfo";
import DrawerVirtual from "./HPL/DrawerVirtual";
import TransactionDrawer from "./HPL/TransactionDrawer";
import VirtualTable from "./HPL/VirtualTable";
import HPLDrawerReceive from "./HPL/HPLDrawerReceive";
import { useHPL } from "@pages/hooks/hplHook";
import ICRCSubInfo from "./ICRC/detail/subaccountTableInfo";
import DrawerTransaction from "./ICRC/detail/transaction/Transaction";
import DrawerAction from "./ICRC/drawer/DrawerAction";
import DrawerSend from "./ICRC/drawer/DrawerSend";
import DrawerReceive from "./ICRC/drawer/DrawerReceive";
import AllowanceList from "./ICRC/allowance/AllowanceList";
import AddAllowanceDrawer from "./ICRC/allowance/AddAllowanceDrawer";
import ICRCTransactionsTable from "./ICRC/detail/transaction/TransactionsTable";
import HPLSubaccountAction from "./HPL/SubaccountActions";

const icrc1DrawerOptions = [
  { name: "send", type: DrawerOptionEnum.Enum.SEND },
  { name: "receive", type: DrawerOptionEnum.Enum.RECEIVE },
];

const hplDrawerOptions = [{ name: "exchange", type: DrawerOptionEnum.Enum.HPL_QR, disabled: true }];

const DetailList = () => {
  const { protocol } = AssetHook();
  const { selectSub } = useHPL(false);
  const { drawerOption, setDrawerOption, drawerOpen, setDrawerOpen } = DrawerHook();
  const [subInfoType, setSubInfoType] = useState<ICRCSubaccountInfo>(ICRCSubaccountInfoEnum.Enum.TRANSACTIONS);
  const { selectedTransaction } = UseTransaction();

  const [selectedVirtualAccount, setSelectedVirtualAccount] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVirtualAccount(null);
  }, [selectSub]);

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
            <HPLSubaccountAction
              onActionClick={handleActionClick}
              enableReceiveAction={selectedVirtualAccount ? true : false}
            />
          )}
        </div>
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
          <ICRCSubInfo subInfoType={subInfoType} setSubInfoType={setSubInfoType}>
            {subInfoType === ICRCSubaccountInfoEnum.Enum.TRANSACTIONS && (
              <ICRCTransactionsTable setDrawerOpen={setDrawerOpen} />
            )}
            {subInfoType === ICRCSubaccountInfoEnum.Enum.ALLOWANCES && (
              <>
                <AddAllowanceDrawer />
                <AllowanceList />
              </>
            )}
          </ICRCSubInfo>
        ) : (
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
        )}
      </div>

      <div
        id="right-drower"
        className={`h-full fixed z-[999] top-0 w-[28rem] overflow-x-hidden transition-{right} duration-500 ${
          drawerOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        {getDrawers(protocol)}
      </div>
    </>
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

  function getDrawers(option: ProtocolType) {
    switch (option) {
      case "ICRC1":
        return selectedTransaction ? (
          <DrawerTransaction setDrawerOpen={setDrawerOpen} />
        ) : (
          <div className="flex flex-col items-center justify-start w-full h-full gap-5 px-6 pt-8 bg-PrimaryColorLight dark:bg-PrimaryColor">
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
  }
};

export default DetailList;
