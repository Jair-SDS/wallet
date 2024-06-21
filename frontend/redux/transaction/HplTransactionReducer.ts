import { SendingStatus, SendingStatusEnum } from "@common/const";
import { HPLAsset, HplTxUser } from "@redux/models/AccountModels";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface HplTransactionState {
  hplSender: HplTxUser;
  hplReceiver: HplTxUser;
  hplFtTx: HPLAsset;
  initTime: Date;
  endTime: Date;
  amount: string;
  sendingStatus: SendingStatus;
}

const initialTransactionState: HplTransactionState = {
  initTime: new Date(),
  endTime: new Date(),
  // HPL
  amount: "",
  sendingStatus: SendingStatusEnum.Values.none,
  hplSender: {
    type: "SUBACCOUNT",
    principal: "",
    vIdx: "",
  },
  hplReceiver: {
    type: "SUBACCOUNT",
    principal: "",
    vIdx: "",
  },
  hplFtTx: {} as any,
};

const hplTransactionSlice = createSlice({
  name: "hpl-transaction",
  initialState: initialTransactionState,
  reducers: {
    setAmount(state: HplTransactionState, action: PayloadAction<string>) {
      state.amount = action.payload;
    },
    setInitTime(state: HplTransactionState, action: PayloadAction<Date>) {
      state.initTime = action.payload;
    },
    setEndTime(state: HplTransactionState, action: PayloadAction<Date>) {
      state.endTime = action.payload;
    },
    setHplSender(state: HplTransactionState, action: PayloadAction<HplTxUser>) {
      state.hplSender = action.payload;
    },
    setHplReceiver(state: HplTransactionState, action: PayloadAction<HplTxUser>) {
      state.hplReceiver = action.payload;
    },
    setHplFt(state: HplTransactionState, action: PayloadAction<HPLAsset>) {
      state.hplFtTx = action.payload;
    },
    setSendingStatus(state: HplTransactionState, action: PayloadAction<SendingStatus>) {
      state.sendingStatus = action.payload;
    },
    resetSendState(state: HplTransactionState) {
      state.amount = initialTransactionState?.amount || "";
      state.hplReceiver = initialTransactionState.hplReceiver;
      state.hplSender = initialTransactionState.hplSender;
      state.hplFtTx = initialTransactionState.hplFtTx;
    },
  },
});

export const {
  setInitTime,
  setEndTime,
  setHplSender,
  setHplReceiver,
  setHplFt,
  resetSendState,
  setAmount,
  setSendingStatus,
} = hplTransactionSlice.actions;

export default hplTransactionSlice.reducer;
