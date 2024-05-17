import { combineReducers } from "redux";
import auth from "./auth/AuthReducer";
import asset from "./assets/AssetReducer";
import contacts from "./contacts/ContactsReducer";
import allowance from "./allowance/AllowanceReducer";
import transaction from "./transaction/TransactionReducer";
import common from "./common/CommonReducer";
import hpl from "./hpl/HplReducer";

const appReducer = combineReducers({
  common,
  auth,
  asset,
  contacts,
  allowance,
  transaction,
  hpl,
});

const RootReducer = (state: any, action: any) => {
  return appReducer(state, action);
};

export default RootReducer;
