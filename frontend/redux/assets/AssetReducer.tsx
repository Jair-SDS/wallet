import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { FungibleTokenLocal, TokenMarketInfo } from "@redux/models/TokenModels";
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
import { getUSDfromToken } from "@/utils";
import { ProtocolType, ProtocolTypeEnum } from "@/const";
import { HPLClient } from "@research-ag/hpl-client";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { ICRC1systemAssets } from "@/defaultTokens";
import { db } from "@/database/db";

const defaultValue = {} as any;
interface AssetState {
  storageCode: string;
  protocol: ProtocolType;
  // ICRC 1
  initLoad: boolean;
  ICPSubaccounts: Array<ICPSubAccount>;
  icr1SystemAssets: Asset[];
  tokensMarket: TokenMarketInfo[];
  assets: Array<Asset>;
  accounts: Array<SubAccount>;
  accordionIndex: string[];
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
  mintActor: ActorSubclass<HplMintActor>;
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
  icr1SystemAssets: ICRC1systemAssets,
  tokensMarket: [],
  assets: [],
  accounts: [],
  accordionIndex: [],
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
  mintActor: defaultValue,
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
    setICRC1SystemAssets(state, action: PayloadAction<Asset[]>) {
      state.icr1SystemAssets = [...ICRC1systemAssets, ...action.payload];
    },
    setICPSubaccounts(state, action: PayloadAction<ICPSubAccount[]>) {
      state.ICPSubaccounts = action.payload;
    },
    setTokenMarket(state, action: PayloadAction<TokenMarketInfo[]>) {
      state.tokensMarket = action.payload;
    },
    // asset reducers
    setAssets(state, action) {
      state.assets = action.payload.sort((a: Asset, b: Asset) => {
        return a.sortIndex - b.sortIndex;
      });
    },
    // sub accounts reducers
    updateSubAccountBalance: {
      reducer(state, { payload }: PayloadAction<{ tokenSymbol: string; subAccountId: string; amount: string }>) {
        const { tokenSymbol, subAccountId, amount } = payload;
        const assetIndex = state.assets.findIndex((asset) => asset.tokenSymbol === tokenSymbol);

        const marketPrince = state.tokensMarket.find((tokenMarket) => tokenMarket.symbol === tokenSymbol)?.price || "0";
        const decimals = state.assets.find((asset) => asset.tokenSymbol === tokenSymbol)?.decimal;
        const USDAmount = marketPrince ? getUSDfromToken(amount, marketPrince, Number(decimals)) : "0";

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
    setAccounts(state, action) {
      state.accounts = action.payload;
    },
    setSelectedAsset(state, action) {
      state.selectedAsset = action.payload;
    },
    setSelectedAccount(state, action) {
      state.selectedAccount = action.payload;
    },
    setAccordionAssetIdx(state, action: PayloadAction<string[]>) {
      state.accordionIndex = action.payload;
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
    setMintActor(state, action: PayloadAction<ActorSubclass<HplMintActor>>) {
      state.mintActor = action.payload;
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
      // localStorage.setItem("nhpl-" + state.storageCode, JSON.stringify(newCount));
      db().updateHplCountByLedger([newCount]);
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
        // localStorage.setItem("nhpl-" + state.storageCode, JSON.stringify(newCount));
        db().updateHplCountByLedger([newCount]);
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
      (state.initLoad = true), (state.ICPSubaccounts = []);
      state.tokensMarket = [];
      state.accounts = [];
      state.assets = [];
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
      state.ownerId = "";
      state.protocol = ProtocolTypeEnum.Enum.HPL;
      state.accordionIndex = [];
      state.icr1SystemAssets = ICRC1systemAssets;
    },
  },
});

export const {
  setStorageCodeA,
  setInitLoad,
  clearDataAsset,
  setProtocol,
  setICRC1SystemAssets,
  setICPSubaccounts,
  setTokenMarket,
  setAssets,
  setAccounts,
  setSelectedAsset,
  setSelectedAccount,
  setAccordionAssetIdx,
  updateSubAccountBalance,
  // HPL LEDGER
  setOwnerId,
  setnHpl,
  setHPLClient,
  setIngressActor,
  setOwnersActor,
  setMintActor,
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
