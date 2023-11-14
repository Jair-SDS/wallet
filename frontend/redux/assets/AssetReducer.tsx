import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Token, TokenMarketInfo } from "@redux/models/TokenModels";
import {
  Asset,
  HPLAsset,
  HPLAssetData,
  HPLSubAccount,
  HPLSubData,
  HPLVirtualData,
  HPLVirtualSubAcc,
  ICPSubAccount,
  SubAccount,
  Transaction,
  TransactionList,
} from "@redux/models/AccountModels";
import bigInt from "big-integer";
import { hexToNumber } from "@/utils";
import { ProtocolType, ProtocolTypeEnum } from "@/const";
import { HPLClient } from "@research-ag/hpl-client";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as IngressActor } from "@candid/service.did.d";

const defaultValue = {} as any;
interface AssetState {
  protocol: ProtocolType;
  // ICRC 1
  ICPSubaccounts: Array<ICPSubAccount>;
  assetLoading: boolean;
  tokens: Token[];
  tokensMarket: TokenMarketInfo[];
  assets: Array<Asset>;
  accounts: Array<SubAccount>;
  acordeonIdx: string;
  transactions: Array<Transaction>;
  selectedAsset: Asset | undefined;
  selectedAccount: SubAccount | undefined;
  selectedTransaction: Transaction | undefined;
  txWorker: Array<TransactionList>;
  txLoad: boolean;
  // HPL LEDGER
  hplClient: HPLClient;
  ingressActor: ActorSubclass<IngressActor>;
  subaccounts: HPLSubAccount[];
  hplFTs: HPLAsset[];
  hplFTsData: HPLAssetData[];
  hplSubsData: HPLSubData[];
  hplVTsData: HPLVirtualData[];
  selectSub: HPLSubAccount | undefined;
  selectVt: HPLVirtualSubAcc | undefined;
}

const initialState: AssetState = {
  protocol: ProtocolTypeEnum.Enum.ICRC1,
  // ICRC 1
  ICPSubaccounts: [],
  assetLoading: false,
  tokens: [],
  tokensMarket: [],
  assets: [],
  accounts: [],
  acordeonIdx: "asset-0",
  transactions: [],
  selectedAsset: undefined,
  selectedAccount: undefined,
  selectedTransaction: undefined,
  txWorker: [],
  txLoad: false,
  // HPL LEDGER
  hplClient: defaultValue,
  ingressActor: defaultValue,
  subaccounts: [],
  hplFTs: [],
  hplFTsData: [],
  hplSubsData: [],
  hplVTsData: [],
  selectSub: undefined,
  selectVt: undefined,
};

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    setProtocol(state, action: PayloadAction<ProtocolType>) {
      state.protocol = action.payload;
    },
    setICPSubaccounts(state, action: PayloadAction<ICPSubAccount[]>) {
      state.ICPSubaccounts = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.assetLoading = action.payload;
    },
    setTokens(state, action: PayloadAction<Token[]>) {
      state.tokens = action.payload;
    },
    addToken(state, action: PayloadAction<Token>) {
      state.tokens.push(action.payload);
    },
    removeToken(state, action: PayloadAction<string>) {
      state.tokens = state.tokens.filter((tkn) => tkn.symbol !== action.payload);
      state.assets = state.assets.filter((asst) => asst.tokenSymbol !== action.payload);
    },
    editToken: {
      reducer(
        state,
        action: PayloadAction<{
          token: Token;
          tokenSymbol: string;
        }>,
      ) {
        const { token, tokenSymbol } = action.payload;
        const auxTokens = state.tokens.map((tkn) => {
          if (tkn.id_number === token.id_number) {
            return token;
          } else return tkn;
        });
        const auxAssets = state.assets.map((asst) => {
          if (asst.tokenSymbol === tokenSymbol) {
            return { ...asst, symbol: token.symbol, name: token.name, index: token.index };
          } else return asst;
        });
        state.tokens = auxTokens;
        state.assets = auxAssets;
      },
      prepare(token: Token, tokenSymbol: string) {
        return {
          payload: { token, tokenSymbol },
        };
      },
    },
    setSubAccountName: {
      reducer(
        state,
        action: PayloadAction<{
          tokenIndex: number | string;
          subaccountId: number | string;
          name: string;
        }>,
      ) {
        const { tokenIndex, subaccountId, name } = action.payload;

        if (state.assets[Number(tokenIndex)] && state.assets[Number(tokenIndex)].subAccounts[Number(subaccountId)])
          state.assets[Number(tokenIndex)].subAccounts[Number(subaccountId)].name = name;
        if (state.tokens[Number(tokenIndex)] && state.tokens[Number(tokenIndex)].subAccounts[Number(subaccountId)])
          state.tokens[Number(tokenIndex)].subAccounts[Number(subaccountId)].name = name;
      },
      prepare(tokenIndex: string | number, subaccountId: string | number, name: string) {
        return {
          payload: { tokenIndex, subaccountId, name },
        };
      },
    },
    setTokenMarket(state, action: PayloadAction<TokenMarketInfo[]>) {
      state.tokensMarket = action.payload;
    },
    addSubAccount: {
      reducer(
        state,
        action: PayloadAction<{
          tokenIndex: number | string;
          subaccount: SubAccount;
        }>,
      ) {
        const { tokenIndex, subaccount } = action.payload;
        if (state.assets[Number(tokenIndex)]) {
          state.assets[Number(tokenIndex)].subAccounts.push(subaccount);
          state.assets[Number(tokenIndex)].subAccounts.sort((a, b) => {
            return Number(a.sub_account_id) - Number(b.sub_account_id);
          });
        }
        if (state.tokens[Number(tokenIndex)]) {
          state.tokens[Number(tokenIndex)].subAccounts.push({
            name: subaccount.name,
            numb: subaccount.sub_account_id,
          });
          state.tokens[Number(tokenIndex)].subAccounts.sort((a, b) => {
            return hexToNumber(a.numb)?.compare(hexToNumber(b.numb) || bigInt(0)) || 0;
          });
        }
      },
      prepare(tokenIndex: string | number, subaccount: SubAccount) {
        return {
          payload: { tokenIndex, subaccount },
        };
      },
    },
    removeSubAcc: {
      reducer(
        state,
        action: PayloadAction<{
          tokenIndex: number | string;
          subIndex: number | string;
        }>,
      ) {
        const { tokenIndex, subIndex } = action.payload;
        if (state.assets[Number(tokenIndex)]) {
          state.assets[Number(tokenIndex)].subAccounts.splice(Number(subIndex), 1);
        }
        if (state.tokens[Number(tokenIndex)]) {
          state.tokens[Number(tokenIndex)].subAccounts.splice(Number(subIndex), 1);
        }
      },
      prepare(tokenIndex: string | number, subIndex: string | number) {
        return {
          payload: { tokenIndex, subIndex },
        };
      },
    },
    setAssets(state, action) {
      (state.assets = action.payload.sort((a: any, b: any) => {
        return a.sort_index - b.sort_index;
      })),
        (state.assetLoading = false);
    },
    setAccounts(state, action) {
      state.accounts = action.payload;
    },
    setTransactions(state, action) {
      state.transactions = action.payload;
    },
    setSelectedAsset(state, action) {
      state.selectedAsset = action.payload;
    },
    setSelectedAccount(state, action) {
      const txList = [...state.txWorker];

      let auxTx = txList.find((tx: TransactionList) => {
        return tx.symbol === action.payload.symbol && tx.subaccount === action.payload.sub_account_id;
      });

      state.transactions = auxTx?.tx || [];
      state.selectedAccount = action.payload;
    },
    setSelectedTransaction(state, action) {
      state.selectedTransaction = action.payload;
    },
    setTxWorker(state, action) {
      const txList = [...state.txWorker];

      let idx = txList.findIndex((tx: TransactionList) => {
        return tx.symbol === action.payload.symbol && tx.subaccount === action.payload.subaccount;
      });
      let auxTx = txList.find((tx: TransactionList) => {
        return tx.symbol === action.payload.symbol && tx.subaccount === action.payload.subaccount;
      });

      if (!auxTx) {
        txList.push(action.payload);
      } else {
        txList[idx] = action.payload;
      }

      state.txWorker = txList;
    },
    setTxLoad(state, action) {
      state.txLoad = action.payload;
    },
    setAcordeonAssetIdx(state, action: PayloadAction<string>) {
      state.acordeonIdx = action.payload;
    },
    setHPLClient(state, action: PayloadAction<HPLClient>) {
      state.hplClient = action.payload;
    },
    setIngressActor(state, action: PayloadAction<ActorSubclass<IngressActor>>) {
      state.ingressActor = action.payload;
    },
    setHPLSubAccounts(state, action: PayloadAction<HPLSubAccount[]>) {
      state.subaccounts = action.payload;
    },
    setHPLAssets(state, action: PayloadAction<HPLAsset[]>) {
      state.hplFTs = action.payload;
    },
    setHPLAssetsData(state, action: PayloadAction<HPLAssetData[]>) {
      state.hplFTsData = action.payload;
    },
    setHPLSubsData(state, action: PayloadAction<HPLSubData[]>) {
      state.hplSubsData = action.payload;
    },
    setHPLVTsData(state, action: PayloadAction<HPLVirtualData[]>) {
      state.hplVTsData = action.payload;
    },
    setHPLSelectedSub(state, action: PayloadAction<HPLSubAccount | undefined>) {
      state.selectSub = action.payload;
    },
    setHPLSelectedVt(state, action: PayloadAction<HPLVirtualSubAcc | undefined>) {
      state.selectVt = action.payload;
    },
    editHPLAsset: {
      reducer(
        state,
        action: PayloadAction<{
          ftEdited: HPLAsset;
          ftData: HPLAssetData[];
        }>,
      ) {
        const { ftEdited, ftData } = action.payload;
        const auxFts = state.hplFTs.map((ft) => {
          if (ft.id === ftEdited.id) {
            return ftEdited;
          } else return ft;
        });
        state.hplFTs = auxFts;
        state.hplFTsData = ftData;
      },
      prepare(ftEdited: HPLAsset, ftData: HPLAssetData[]) {
        return {
          payload: { ftEdited, ftData },
        };
      },
    },
    editHPLSub: {
      reducer(
        state,
        action: PayloadAction<{
          subEdited: HPLSubAccount;
          subData: HPLSubData[];
        }>,
      ) {
        const { subEdited, subData } = action.payload;
        const auxSubs = state.subaccounts.map((sb) => {
          if (sb.sub_account_id === subEdited.sub_account_id) {
            return subEdited;
          } else return sb;
        });
        state.subaccounts = auxSubs;
        state.hplSubsData = subData;
      },
      prepare(subEdited: HPLSubAccount, subData: HPLSubData[]) {
        return {
          payload: { subEdited, subData },
        };
      },
    },
    clearDataAsset(state) {
      state.ICPSubaccounts = [];
      state.tokens = [];
      state.tokensMarket = [];
      state.accounts = [];
      state.assets = [];
      state.transactions = [];
      state.txWorker = [];
      state.selectedAccount = undefined;
      state.selectedAsset = undefined;
      state.selectedTransaction = undefined;
      state.hplClient = defaultValue;
      state.subaccounts = [];
      state.hplFTs = [];
      state.hplFTsData = [];
      state.hplSubsData = [];
      state.hplVTsData = [];
    },
  },
});

export const {
  clearDataAsset,
  setProtocol,
  setICPSubaccounts,
  setLoading,
  setTokens,
  addToken,
  removeToken,
  editToken,
  setTokenMarket,
  setSubAccountName,
  addSubAccount,
  removeSubAcc,
  setAssets,
  setAccounts,
  setTransactions,
  setSelectedAsset,
  setSelectedAccount,
  setSelectedTransaction,
  setTxWorker,
  setTxLoad,
  setAcordeonAssetIdx,
  // HPL LEDGER
  setHPLClient,
  setIngressActor,
  setHPLSubAccounts,
  setHPLAssets,
  setHPLAssetsData,
  setHPLSubsData,
  setHPLVTsData,
  setHPLSelectedSub,
  setHPLSelectedVt,
  editHPLAsset,
  editHPLSub,
} = assetSlice.actions;

export default assetSlice.reducer;
