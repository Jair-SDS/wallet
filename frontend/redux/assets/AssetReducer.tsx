import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { FungibleTokenLocal, Token, TokenMarketInfo, TokenSubAccount } from "@redux/models/TokenModels";
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
  nHplData,
} from "@redux/models/AccountModels";
import bigInt from "big-integer";
import { hexToNumber, getUSDfromToken } from "@/utils";
import { ProtocolType, ProtocolTypeEnum } from "@/const";
import { HPLClient } from "@research-ag/hpl-client";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { localDb, rxDb } from "@/database/db";
import store from "@redux/Store";
import { setAssetFromLocalData, updateAllBalances } from "./AssetActions";

const defaultValue = {} as any;
interface AssetState {
  storageCode: string;
  protocol: ProtocolType;
  // ICRC 1
  initLoad: boolean;
  ICPSubaccounts: Array<ICPSubAccount>;
  assetLoading: boolean;
  tokens: Token[];
  tokensMarket: TokenMarketInfo[];
  assets: Array<Asset>;
  accounts: Array<SubAccount>;
  acordeonIdx: string[];
  transactions: Array<Transaction>;
  selectedAsset: Asset | undefined;
  selectedAccount: SubAccount | undefined;
  selectedTransaction: Transaction | undefined;
  txWorker: Array<TransactionList>;
  txLoad: boolean;
  // HPL LEDGER
  ownerId: string;
  hplClient: HPLClient;
  ingressActor: ActorSubclass<IngressActor>;
  ownersActor: ActorSubclass<OwnersActor>;
  subaccounts: HPLSubAccount[];
  hplFTs: HPLAsset[];
  hplFTsData: HPLAssetData[];
  dictionaryHplFTs: FungibleTokenLocal[];
  hplSubsData: HPLSubData[];
  hplVTsData: HPLVirtualData[];
  selectSub: HPLSubAccount | undefined;
  selectVt: HPLVirtualSubAcc | undefined;
  nHpl: nHplData;
  feeConstant: number;
  allAssetsView: boolean;
}

const initialState: AssetState = {
  storageCode: "",
  protocol: ProtocolTypeEnum.Enum.HPL,
  // ICRC 1
  initLoad: true,
  ICPSubaccounts: [],
  assetLoading: false,
  tokens: [],
  tokensMarket: [],
  assets: [],
  accounts: [],
  acordeonIdx: [],
  transactions: [],
  selectedAsset: undefined,
  selectedAccount: undefined,
  selectedTransaction: undefined,
  txWorker: [],
  txLoad: false,
  // HPL LEDGER
  ownerId: "",
  nHpl: { nAccounts: "0", nFtAssets: "0", nVirtualAccounts: "0" },
  hplClient: defaultValue,
  ingressActor: defaultValue,
  ownersActor: defaultValue,
  subaccounts: [],
  hplFTs: [],
  hplFTsData: [],
  dictionaryHplFTs: [],
  hplSubsData: [],
  hplVTsData: [],
  selectSub: undefined,
  selectVt: undefined,
  feeConstant: 50000,
  allAssetsView: false,
};

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    setStorageCodeA(state, action: PayloadAction<string>) {
      state.storageCode = action.payload;
    },
    setProtocol(state, action: PayloadAction<ProtocolType>) {
      state.protocol = action.payload;
    },
    setInitLoad(state, action: PayloadAction<boolean>) {
      state.initLoad = action.payload;
    },
    setReduxTokens(state, action: PayloadAction<Token[]>) {
      state.tokens = action.payload;
    },
    setICPSubaccounts(state, action: PayloadAction<ICPSubAccount[]>) {
      state.ICPSubaccounts = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.assetLoading = action.payload;
    },
    // TODO: Revisit this code to see if we can use filter()
    removeToken(state, action: PayloadAction<string>) {
      const { payload: symbolToRemove } = action;
      let count = 0;

      // Iterate all Tokens and ignore the one that has
      // the symbol marked to be removed
      const auxTkns: Token[] = [];
      state.tokens.map((tkn) => {
        count++;
        if (tkn.symbol !== symbolToRemove) {
          auxTkns.push({ ...tkn, id_number: count - 1 });
        }
      });
      state.tokens = auxTkns;

      count = 0;

      // Iterate all Assets and ignore the one that has
      // the symbol marked to be removed
      const auxAssets: Asset[] = [];
      state.assets.map((asst) => {
        count++;
        if (asst.tokenSymbol !== symbolToRemove) {
          auxAssets.push({ ...asst, sort_index: count - 1 });
        }
      });
      state.assets = auxAssets;
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
          } else
            return {
              ...tkn,
              shortDecimal:
                tkn.shortDecimal === "" ? Number(tkn.decimal).toFixed() : Number(tkn.shortDecimal).toFixed(),
            };
        });
        const auxAssets = state.assets.map((asst) => {
          if (asst.tokenSymbol === tokenSymbol) {
            return {
              ...asst,
              symbol: token.symbol,
              name: token.name,
              index: token.index,
              shortDecimal:
                token.shortDecimal === "" ? Number(token.decimal).toFixed() : Number(token.shortDecimal).toFixed(),
            };
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
    updateSubAccountBalance: {
      reducer(state, { payload }: PayloadAction<{ tokenSymbol: string; subAccountId: string; amount: string }>) {
        const { tokenSymbol, subAccountId, amount } = payload;
        const tokenIndex = state.tokens.findIndex((token) => token.tokenSymbol === tokenSymbol);
        const assetIndex = state.assets.findIndex((asset) => asset.tokenSymbol === tokenSymbol);

        const marketPrince = state.tokensMarket.find((tokenMarket) => tokenMarket.symbol === tokenSymbol)?.price || "0";
        const decimals = state.assets.find((asset) => asset.tokenSymbol === tokenSymbol)?.decimal;
        const USDAmount = marketPrince ? getUSDfromToken(amount, marketPrince, Number(decimals)) : "0";

        if (tokenIndex !== -1 && state.tokens[tokenIndex]) {
          const newTokenSubAccounts: TokenSubAccount[] = state.tokens[tokenIndex].subAccounts.map((subAccount) => {
            if (subAccount.numb === subAccountId) {
              return {
                ...subAccount,
                amount,
                currency_amount: USDAmount,
              };
            }
            return subAccount;
          });

          state.tokens[tokenIndex].subAccounts = newTokenSubAccounts;
        }

        if (assetIndex !== -1 && state.assets[assetIndex]) {
          const newAssetSubAccounts = state.assets[assetIndex].subAccounts.map((subAccount) => {
            if (subAccount.sub_account_id === subAccountId) {
              return {
                ...subAccount,
                amount,
                currency_amount: USDAmount,
              };
            }
            return subAccount;
          });

          state.assets[assetIndex].subAccounts = newAssetSubAccounts;
        }
      },
      prepare(tokenSymbol: string, subAccountId: string, amount: string) {
        return { payload: { tokenSymbol, subAccountId, amount } };
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
            amount: subaccount.amount,
            currency_amount: subaccount.currency_amount,
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
      state.assets = action.payload.sort((a: any, b: any) => {
        return a.sort_index - b.sort_index;
      });
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
      state.selectedAccount = action.payload;
    },
    setSelectedTransaction(state, action) {
      state.selectedTransaction = action.payload;
    },
    setTxWorker(state, action) {
      const txList = [...state.txWorker];

      const idx = txList.findIndex((tx: TransactionList) => {
        return tx.symbol === action.payload.symbol && tx.subaccount === action.payload.subaccount;
      });
      const auxTx = txList.find((tx: TransactionList) => {
        return tx.symbol === action.payload.symbol && tx.subaccount === action.payload.subaccount;
      });

      if (!auxTx) {
        txList.push(action.payload);
      } else {
        txList[idx] = action.payload;
      }

      state.txWorker = txList;
    },
    addTxWorker(state, action: PayloadAction<TransactionList>) {
      state.txWorker = [...state.txWorker, action.payload];
    },
    setTxLoad(state, action) {
      state.txLoad = action.payload;
    },
    setAcordeonAssetIdx(state, action: PayloadAction<string[]>) {
      state.acordeonIdx = action.payload;
    },
    setOwnerId(state, action: PayloadAction<string>) {
      state.ownerId = action.payload;
    },
    setnHpl(state, action: PayloadAction<nHplData>) {
      state.nHpl = action.payload;
    },
    setHPLClient(state, action: PayloadAction<HPLClient>) {
      state.hplClient = action.payload;
    },
    setIngressActor(state, action: PayloadAction<ActorSubclass<IngressActor>>) {
      state.ingressActor = action.payload;
    },
    setOwnersActor(state, action: PayloadAction<ActorSubclass<OwnersActor>>) {
      state.ownersActor = action.payload;
    },
    setHPLSubAccounts(state, action: PayloadAction<HPLSubAccount[]>) {
      state.subaccounts = action.payload;
    },
    setHPLAssets(state, action: PayloadAction<HPLAsset[]>) {
      state.hplFTs = action.payload;
    },
    setHPLDictionary(state, action: PayloadAction<FungibleTokenLocal[]>) {
      state.dictionaryHplFTs = action.payload;
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
    setFeeConstant(state, action: PayloadAction<number>) {
      state.feeConstant = action.payload;
    },
    setAllAssetsView(state, action: PayloadAction<boolean>) {
      state.allAssetsView = action.payload;
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
    addHplSub(state, action: PayloadAction<HPLSubData>) {
      state.hplSubsData.push(action.payload);
      state.subaccounts.push({
        sub_account_id: action.payload.id,
        name: action.payload.name,
        amount: "0",
        currency_amount: "0",
        transaction_fee: "0",
        ft: action.payload.ftId,
        virtuals: [],
      });
      const newCount = { ...state.nHpl, nAccounts: (BigInt(state.nHpl.nAccounts) + BigInt(1)).toString() };
      state.nHpl = newCount;
      localStorage.setItem("nhpl-" + state.storageCode, JSON.stringify(newCount));
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
    addHplVt: {
      reducer(
        state,
        action: PayloadAction<{
          vt: HPLVirtualSubAcc;
          vtLocal: HPLVirtualData;
          subId: string;
        }>,
      ) {
        let newSelSub: HPLSubAccount | undefined = undefined;
        const { vt, vtLocal, subId } = action.payload;
        const auxSubs = state.subaccounts.map((sub) => {
          if (sub.sub_account_id === subId) {
            newSelSub = { ...sub, virtuals: [...sub.virtuals, vt] };
            return { ...sub, virtuals: [...sub.virtuals, vt] };
          } else return sub;
        });
        state.subaccounts = auxSubs;
        state.hplVTsData.push(vtLocal);
        const newCount = {
          ...state.nHpl,
          nVirtualAccounts: (BigInt(state.nHpl.nVirtualAccounts) + BigInt(1)).toString(),
        };
        state.nHpl = newCount;
        localStorage.setItem("nhpl-" + state.storageCode, JSON.stringify(newCount));
        if (newSelSub) state.selectSub = newSelSub;
      },
      prepare(vt: HPLVirtualSubAcc, vtLocal: HPLVirtualData, subId: string) {
        return {
          payload: { vt, vtLocal, subId },
        };
      },
    },
    clearDataAsset(state) {
      state.storageCode = "";
      state.ICPSubaccounts = [];
      state.initLoad = true;
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
      state.dictionaryHplFTs = [];
      state.hplSubsData = [];
      state.hplVTsData = [];
      state.acordeonIdx = [];
      state.ownerId = "";
      state.protocol = ProtocolTypeEnum.Enum.HPL;
    },
  },
});

const dbSubscriptionHandler = (x: any[]) => {
  if (x.length > 0) {
    store.dispatch(
      assetSlice.actions.setReduxTokens(
        x.sort((a: any, b: any) => {
          return a.id_number - b.id_number;
        }),
      ),
    );

    if (store.getState().asset.initLoad) setAssetFromLocalData(x, store.getState().auth.authClient);

    updateAllBalances(store.getState().auth.userAgent, x);
  }
};

localDb().subscribeToAllTokens().subscribe(dbSubscriptionHandler);
rxDb().subscribeToAllTokens().subscribe(dbSubscriptionHandler);

export const {
  setStorageCodeA,
  setInitLoad,
  clearDataAsset,
  setProtocol,
  setICPSubaccounts,
  setLoading,
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
  addTxWorker,
  setTxLoad,
  setAcordeonAssetIdx,
  updateSubAccountBalance,
  // HPL LEDGER
  setOwnerId,
  setnHpl,
  setHPLClient,
  setIngressActor,
  setOwnersActor,
  setFeeConstant,
  setAllAssetsView,
  setHPLSubAccounts,
  setHPLAssets,
  setHPLDictionary,
  setHPLAssetsData,
  setHPLSubsData,
  setHPLVTsData,
  setHPLSelectedSub,
  setHPLSelectedVt,
  editHPLAsset,
  editHPLSub,
  addHplSub,
  addHplVt,
} = assetSlice.actions;

export default assetSlice.reducer;
