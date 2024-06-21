import { combineReducers } from "redux";
import auth from "@/redux/auth/AuthReducer";
import asset from "@/redux/assets/AssetReducer";
import contacts from "@/redux/contacts/ContactsReducer";
import allowance from "@/redux/allowance/AllowanceReducer";
import transaction from "@/redux/transaction/TransactionReducer";
import hplTransaction from "@/redux/transaction/HplTransactionReducer";
import common from "@/redux/common/CommonReducer";
import hpl from "./hpl/HplReducer";
import services from "@/redux/services/ServiceReducer";

const appReducer = combineReducers({
  common,
  auth,
  asset,
  contacts,
  allowance,
  transaction,
  services,
  hpl,
  hplTransaction,
});

const RootReducer = (state: any, action: any) => {
  return appReducer(state, action);
};

export default RootReducer;
