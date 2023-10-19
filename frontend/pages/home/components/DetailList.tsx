import { Fragment } from "react";
import DrawerSend from "./ICRC/DrawerSend";
import DrawerWrap from "./ICRC/DrawerWrap";
import DrawerReceive from "./ICRC/DrawerReceive";
import DrawerAction from "./ICRC/DrawerAction";
import DrawerTransaction from "./ICRC/Transaction";
import { DrawerHook } from "../hooks/drawerHook";
import { UseTransaction } from "../hooks/useTransaction";
import { DrawerOptionEnum, ProtocolTypeEnum } from "@/const";
import ICRCSubaccountAction from "./ICRC/SubaccountAction";
import ICRCTransactionsTable from "./ICRC/TransactionsTable";
import HPLSubaccountAction from "./HPL/SubaccountActions";
import { AssetHook } from "../hooks/assetHook";
import SubaccountInfo from "./HPL/SubaccountInfo";
import DrawerVirtual from "./HPL/DrawerVirtual";
import TransactionDrawer from "./HPL/TransactionDrawer";

const DetailList = () => {
  const { protocol } = AssetHook();
  const { drawerOption, setDrawerOption, drawerOpen, setDrawerOpen, hplTx, setHplTx } = DrawerHook();
  const { selectedTransaction } = UseTransaction();

  return (
    <Fragment>
      <div
        className={
          "relative flex flex-col justify-start items-center bg-SecondaryColorLight dark:bg-SecondaryColor w-full pt-6 pr-4 pl-7 gap-2 h-fit min-h-full"
        }
      >
        <div className="flex flex-row justify-between items-center w-full h-[4.75rem] bg-TransactionHeaderColorLight dark:bg-TransactionHeaderColor rounded-md">
          {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
            <ICRCSubaccountAction setDrawerOption={setDrawerOption} setDrawerOpen={setDrawerOpen} />
          ) : (
            <HPLSubaccountAction setDrawerOption={setDrawerOption} setDrawerOpen={setDrawerOpen} setHplTx={setHplTx} />
          )}
        </div>

        <div className="w-full max-h-[calc(100vh-11.25rem)] scroll-y-light">
          {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
            <ICRCTransactionsTable setDrawerOpen={setDrawerOpen} />
          ) : (
            <SubaccountInfo setDrawerOpen={setDrawerOpen} />
          )}
        </div>
      </div>
      <div
        id="right-drower"
        className={`h-[calc(100%-4.5rem)] fixed z-[999] top-4.5rem w-[28rem] overflow-x-hidden transition-{right} duration-500 ${
          drawerOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
          selectedTransaction ? (
            <DrawerTransaction setDrawerOpen={setDrawerOpen} />
          ) : (
            <div className="flex flex-col justify-start items-center bg-PrimaryColorLight dark:bg-PrimaryColor gap-5 w-full h-full pt-8 px-6">
              <DrawerAction drawerOption={drawerOption} setDrawerOption={setDrawerOption} setDrawerOpen={setDrawerOpen}>
                {drawerOption === DrawerOptionEnum.Enum.SEND && (
                  <DrawerSend drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
                )}
                {drawerOption === DrawerOptionEnum.Enum.RECEIVE && <DrawerReceive />}
                {drawerOption === DrawerOptionEnum.Enum.WRAP && <DrawerWrap />}
              </DrawerAction>
            </div>
          )
        ) : hplTx ? (
          <TransactionDrawer
            setDrawerOpen={setDrawerOpen}
            setHplTx={setHplTx}
            drawerOption={drawerOption}
            drawerOpen={drawerOpen}
            locat="detail"
          />
        ) : (
          <DrawerVirtual setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />
        )}
      </div>
    </Fragment>
  );
};

export default DetailList;
