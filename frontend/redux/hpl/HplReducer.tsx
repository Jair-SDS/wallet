import { ActorSubclass } from "@dfinity/agent";
import {
  HPLAsset,
  HPLAssetData,
  HPLSubAccount,
  HPLSubData,
  HPLVirtualData,
  HPLVirtualSubAcc,
  nHplData,
} from "@redux/models/AccountModels";
import { FungibleTokenLocal } from "@redux/models/TokenModels";
import { HPLClient } from "@research-ag/hpl-client";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { db } from "@/database/db";

interface HplAssetState {
  // HPL LEDGER
  ownerId: string;
  hplClient: HPLClient;
  ingressActor: ActorSubclass<IngressActor>;
  ownersActor: ActorSubclass<OwnersActor>;
  mintActor: ActorSubclass<HplMintActor>;
  subaccounts: HPLSubAccount[];
  exchangeLinks: HPLVirtualSubAcc[];
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

const defaultValue = {} as any;
const initialState: HplAssetState = {
  // HPL LEDGER
  ownerId: "",
  nHpl: { nAccounts: "0", nFtAssets: "0", nVirtualAccounts: "0" },
  hplClient: defaultValue,
  ingressActor: defaultValue,
  ownersActor: defaultValue,
  mintActor: defaultValue,
  subaccounts: [],
  exchangeLinks: [],
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

const hplAssetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
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
    setHPLExchangeLinks(state, action: PayloadAction<HPLVirtualSubAcc[]>) {
      state.exchangeLinks = action.payload;
    },
    addHPLExchangeLink(state, action: PayloadAction<HPLVirtualSubAcc>) {
      state.exchangeLinks.push(action.payload);
    },
    editHPLExchangeLink(state, action: PayloadAction<HPLVirtualSubAcc>) {
      const auxLinks = state.exchangeLinks.map((lnk) => {
        if (lnk.virt_sub_acc_id === action.payload.virt_sub_acc_id) {
          return action.payload;
        } else {
          return lnk;
        }
      });
      state.exchangeLinks = auxLinks;
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
        db().updateHplCountByLedger([newCount]);
        if (newSelSub) state.selectSub = newSelSub;
      },
      prepare(vt: HPLVirtualSubAcc, vtLocal: HPLVirtualData, subId: string) {
        return {
          payload: { vt, vtLocal, subId },
        };
      },
    },
  },
});

export const {
  setOwnerId,
  setnHpl,
  setHPLClient,
  setIngressActor,
  setOwnersActor,
  setMintActor,
  setHPLSubAccounts,
  setHPLExchangeLinks,
  addHPLExchangeLink,
  editHPLExchangeLink,
  setHPLAssets,
  setHPLDictionary,
  setHPLAssetsData,
  setHPLSubsData,
  setHPLVTsData,
  setHPLSelectedSub,
  setHPLSelectedVt,
  setFeeConstant,
  setAllAssetsView,
  editHPLAsset,
  addHplSub,
  editHPLSub,
  addHplVt,
} = hplAssetSlice.actions;

export default hplAssetSlice.reducer;
