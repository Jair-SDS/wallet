import { ProtocolType, ProtocolTypeEnum } from "@common/const";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

interface CommonState {
  isAppDataFreshing: boolean;
  lastDataRefresh: string;
  storageCode: string;
  protocol: ProtocolType;
}

const initialState: CommonState = {
  isAppDataFreshing: false,
  lastDataRefresh: dayjs().toISOString(),
  storageCode: "",
  protocol: ProtocolTypeEnum.Enum.HPL,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setAppDataRefreshing(state, action: PayloadAction<boolean>) {
      state.isAppDataFreshing = action.payload;
    },
    setLastDataRefresh(state, action: PayloadAction<string>) {
      state.lastDataRefresh = action.payload;
    },
    setStorageCodeA(state, action: PayloadAction<string>) {
      state.storageCode = action.payload;
    },
    setProtocol(state, action: PayloadAction<ProtocolType>) {
      state.protocol = action.payload;
    },
  },
});

export const { setAppDataRefreshing, setLastDataRefresh, setStorageCodeA, setProtocol } = commonSlice.actions;

export default commonSlice.reducer;
