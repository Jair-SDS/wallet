import { ProtocolType, ProtocolTypeEnum } from "@common/const";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommonState {
  isAppDataFreshing: boolean;
  storageCode: string;
  protocol: ProtocolType;
}

const initialState: CommonState = {
  isAppDataFreshing: false,
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

    setStorageCodeA(state, action: PayloadAction<string>) {
      state.storageCode = action.payload;
    },
    setProtocol(state, action: PayloadAction<ProtocolType>) {
      state.protocol = action.payload;
    },
  },
});

export const { setAppDataRefreshing, setStorageCodeA, setProtocol } = commonSlice.actions;

export default commonSlice.reducer;
