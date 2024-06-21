import store from "@redux/Store";
import {
  resetSendState,
  setAmount,
  setEndTime,
  setHplFt,
  setHplReceiver,
  setHplSender,
  setInitTime,
  setSendingStatus,
} from "./HplTransactionReducer";
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { SendingStatus } from "@common/const";

export function setInitTxTime(init: Date) {
  store.dispatch(setInitTime(init));
}
export function setEndTxTime(init: Date) {
  store.dispatch(setEndTime(init));
}

export function setHplSenderTx(data: HplTxUser) {
  store.dispatch(setHplSender(data));
}

export function setHplReceiverTx(data: HplTxUser) {
  store.dispatch(setHplReceiver(data));
}

export function setHplFtTx(data: HPLAsset) {
  store.dispatch(setHplFt(data));
}

export function resetSendStateAction() {
  store.dispatch(resetSendState());
}
export function setAmountAction(amount: string) {
  store.dispatch(setAmount(amount));
}
export function setSendingStatusAction(status: SendingStatus) {
  store.dispatch(setSendingStatus(status));
}
