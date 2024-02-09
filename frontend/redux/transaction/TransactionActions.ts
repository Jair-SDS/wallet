import store from "@redux/Store";
import {
  setSenderAsset,
  setSenderSubAccount,
  setSenderContact,
  setSenderContactNew,
  setReceiverOwnSubAccount,
  setReceiverNewContact,
  setReceiverContact,
  setScannerActiveOption,
  clearSender,
  clearReceiver,
  setSenderOption,
  setIsNewSender,
  setReceiverOption,
  setReceiverIsManual,
  setIsInspectDetail,
  setAmount,
  setError,
  removeError,
  resetSendState,
  setSendingStatus,
  setIsLoading,
  setInitTime,
  setEndTime,
  setHplSender,
  setHplReceiver,
  setHplFt,
} from "./TransactionReducer";

import { Asset, HPLAsset, HplTxUser, SubAccount } from "@redux/models/AccountModels";
import {
  ContactSubAccount,
  NewContact,
  TransactionReceiverOption,
  TransactionScannerOption,
  TransactionSenderOption,
  ValidationErrorsType,
} from "@/@types/transactions";
import { SendingStatus } from "@/const";

export function setSenderAssetAction(asset: Asset) {
  store.dispatch(setSenderAsset(asset));
}
export function setSenderOptionAction(option: TransactionSenderOption) {
  store.dispatch(setSenderOption(option));
}
export function setIsNewSenderAction(isNewSender: boolean) {
  store.dispatch(setIsNewSender(isNewSender));
}
export function setIsInspectDetailAction(isInspectDetail: boolean) {
  store.dispatch(setIsInspectDetail(isInspectDetail));
}
export function setAmountAction(amount: string) {
  store.dispatch(setAmount(amount));
}
export function setErrorAction(error: ValidationErrorsType) {
  store.dispatch(setError(error));
}
export function removeErrorAction(error: ValidationErrorsType) {
  store.dispatch(removeError(error));
}
export function setSendingStatusAction(status: SendingStatus) {
  store.dispatch(setSendingStatus(status));
}
export function setSenderSubAccountAction(subAccount: SubAccount) {
  store.dispatch(setSenderSubAccount(subAccount));
}
export function setSenderContactAction(contact: ContactSubAccount) {
  store.dispatch(setSenderContact(contact));
}
export function setSenderContactNewAction(newContact: NewContact) {
  store.dispatch(setSenderContactNew(newContact));
}
export function setReceiverOptionAction(option: TransactionReceiverOption) {
  store.dispatch(setReceiverOption(option));
}
export function setReceiverIsManualAction(isManual: boolean) {
  store.dispatch(setReceiverIsManual(isManual));
}
export function setReceiverOwnSubAccountAction(subAccount: SubAccount) {
  store.dispatch(setReceiverOwnSubAccount(subAccount));
}
export function setReceiverNewContactAction(newContact: NewContact) {
  store.dispatch(setReceiverNewContact(newContact));
}
export function setReceiverContactAction(contact: ContactSubAccount) {
  store.dispatch(setReceiverContact(contact));
}
export function setScannerActiveOptionAction(scannerActiveOption: TransactionScannerOption) {
  store.dispatch(setScannerActiveOption(scannerActiveOption));
}
export function clearSenderAction() {
  store.dispatch(clearSender());
}
export function clearReceiverAction() {
  store.dispatch(clearReceiver());
}
export function resetSendStateAction() {
  store.dispatch(resetSendState());
}
export function setIsLoadingAction(isLoading: boolean) {
  store.dispatch(setIsLoading(isLoading));
}

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
