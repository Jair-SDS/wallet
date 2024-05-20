/* eslint-disable no-empty */
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import store from "@redux/Store";
import { SnsToken } from "@redux/models/TokenModels";
import { IcrcTokenMetadataResponse } from "@dfinity/ledger-icrc";
import { formatHPLSubaccounts, formatFtInfo, formatVirtualAccountInfo, formatAccountInfo } from "@common/utils/hpl";
import { setTokenMarket, setICPSubaccounts, setAccordionAssetIdx, setAssets } from "./AssetReducer";
import { AccountIdentifier, SubAccount as SubAccountNNS } from "@dfinity/ledger-icp";
import {
  Asset,
  HPLVirtualData,
  HplContact,
  HplRemote,
  ICPSubAccount,
  ResQueryState,
} from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { AccountType, AssetId, SubId, VirId } from "@research-ag/hpl-client/dist/candid/ledger";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { idlFactory as HplMintIDLFactory } from "@candid/HplMint/candid.did";
import { setHplContacts } from "@redux/contacts/ContactsReducer";
import { UpdateAllBalances } from "@/@types/assets";
import { db } from "@/database/db";
import { hexToUint8Array } from "@common/utils/hexadecimal";
import { getMetadataInfo } from "@common/utils/icrc";
import { getETHRate, getTokensFromMarket } from "@common/utils/market";
import { refreshAssetBalances } from "@pages/home/helpers/assets";
import { getICRCSupportedStandards } from "@common/libs/icrc";
import {
  setHPLAssets,
  setHPLAssetsData,
  setHPLExchangeLinks,
  setHPLSelectedSub,
  setHPLSubAccounts,
  setHPLSubsData,
  setHPLVTsData,
  setOwnerId,
  setnHpl,
} from "@redux/hpl/HplReducer";

/**
 * This function updates the balances for all provided assets and their subaccounts, based on the market price and the account balance.
 *
 * @param params An object containing parameters for the update process.
 * @returns An object containing updated `newAssetsUpload` and `assets` arrays.
 */
export const updateAllBalances: UpdateAllBalances = async (params) => {
  const { myAgent = store.getState().auth.userAgent, assets, basicSearch = false, fromLogin } = params;

  const tokenMarkets = await getTokensFromMarket();
  const ETHRate = await getETHRate();
  if (ETHRate) tokenMarkets.push(ETHRate);
  store.dispatch(setTokenMarket(tokenMarkets));

  const auxAssets = [...assets].sort((a, b) => a.sortIndex - b.sortIndex);
  const myPrincipal = store.getState().auth.userPrincipal;

  if (!myPrincipal) {
    console.warn("No principal found");
    return;
  }

  const updateAssets = await refreshAssetBalances(auxAssets, {
    myAgent,
    basicSearch,
    tokenMarkets,
    myPrincipal,
  });

  const newAssetsUpload = updateAssets.sort((a, b) => a.sortIndex - b.sortIndex);
  store.dispatch(setAssets(newAssetsUpload));

  if (fromLogin) {
    newAssetsUpload.length > 0 && store.dispatch(setAccordionAssetIdx([newAssetsUpload[0].tokenSymbol]));
  }

  const icpAsset = newAssetsUpload.find((asset) => asset.tokenSymbol === "ICP");

  if (icpAsset) {
    const sub: ICPSubAccount[] = [];

    icpAsset.subAccounts.map((saICP) => {
      let subacc: SubAccountNNS | undefined = undefined;

      try {
        subacc = SubAccountNNS.fromBytes(hexToUint8Array(saICP.sub_account_id)) as SubAccountNNS;
      } catch {
        subacc = undefined;
      }

      sub.push({
        legacy: AccountIdentifier.fromPrincipal({
          principal: myPrincipal,
          subAccount: subacc,
        }).toHex(),
        sub_account_id: saICP.sub_account_id,
      });
    });

    store.dispatch(setICPSubaccounts(sub));
  }

  return newAssetsUpload;
};

export const updateHPLBalances = async (
  actor: ActorSubclass<IngressActor>,
  owner: ActorSubclass<OwnersActor>,
  contacts: HplContact[],
  principal: string,
  fromWorker?: boolean,
  updateInfo?: boolean,
  nLocalData?: {
    nAccounts: string;
    nVirtualAccounts: string;
    nFtAssets: string;
  },
  fromReload?: boolean,
) => {
  // Get amounts nAccounts, nVirtualAccounts, nFtAssets
  const nLocalHpl = {
    nAccounts: nLocalData ? nLocalData.nAccounts : "0",
    nVirtualAccounts: nLocalData ? nLocalData.nVirtualAccounts : "0",
    nFtAssets: nLocalData ? nLocalData.nFtAssets : "0",
  };
  const nHpl = store.getState().hpl.nHpl;
  const nInfo = {
    nAccounts: BigInt(nLocalHpl.nAccounts || nHpl.nAccounts || 0),
    nVirtualAccounts: BigInt(nLocalHpl.nVirtualAccounts || nHpl.nVirtualAccounts || 0),
    nFtAssets: BigInt(nLocalHpl.nFtAssets || nHpl.nFtAssets || 0),
  };
  if (!fromWorker || updateInfo) {
    const nData = {
      nAccounts: "0",
      nVirtualAccounts: "0",
      nFtAssets: "0",
    };
    try {
      const nAccounts = await actor.nAccounts();
      nData.nAccounts = nAccounts.toString();
      nInfo.nAccounts = nAccounts;
    } catch (e) {
      console.log("err-nHpl", e);
    }
    try {
      const nVirtualAccounts = await actor.nVirtualAccounts();
      nData.nVirtualAccounts = nVirtualAccounts.toString();
      nInfo.nVirtualAccounts = nVirtualAccounts;
    } catch (e) {
      console.log("err-nHpl", e);
    }
    try {
      const nFtAssets = await actor.nFtAssets();
      nData.nFtAssets = nFtAssets.toString();
      nInfo.nFtAssets = nFtAssets;
    } catch (e) {
      console.log("err-nHpl", e);
    }

    // localStorage.setItem("nhpl-" + principal, JSON.stringify(nData));
    await db().updateHplCountByLedger([nData]);
    store.dispatch(setnHpl(nData));
  }

  let subAccInfo: Array<[SubId, AccountType]> | undefined = undefined;
  if (nInfo.nAccounts > BigInt(nLocalHpl.nAccounts) || (updateInfo && nInfo.nAccounts !== BigInt(0))) {
    try {
      subAccInfo = await actor.accountInfo({ idRange: [BigInt(0), [nInfo.nAccounts - BigInt(1)]] });
    } catch (e) {
      console.log("errAccountInfo", e);
    }
  }

  let ftInfo:
    | Array<
        [
          AssetId,
          {
            controller: Principal;
            decimals: number;
            description: string;
          },
        ]
      >
    | undefined = undefined;
  if (nInfo.nFtAssets > BigInt(nLocalHpl.nFtAssets) || (updateInfo && nInfo.nFtAssets !== BigInt(0))) {
    try {
      ftInfo = await actor.ftInfo({ idRange: [BigInt(0), [nInfo.nFtAssets - BigInt(1)]] });
    } catch (e) {
      console.log("errFtInfor", e);
    }
  }

  let vtData = updateInfo ? await db().getHplVirtuals() : store.getState().hpl.hplVTsData;
  let vtInfo: Array<[VirId, [AccountType, Principal]]> | undefined = undefined;
  if (
    nInfo.nVirtualAccounts > BigInt(nLocalHpl.nVirtualAccounts) ||
    ((updateInfo || vtData.length === 0) && nInfo.nVirtualAccounts !== BigInt(0))
  ) {
    try {
      vtInfo = await actor.virtualAccountInfo({ idRange: [BigInt(0), [nInfo.nVirtualAccounts - BigInt(1)]] });
    } catch (e) {
      console.log("errVirtualAccountInfo", e);
    }
  }

  const remotesToLook: { id: [Principal, bigint] }[] = [];
  contacts.map((cntc) => {
    const pncpl = Principal.fromText(cntc.principal);
    cntc.remotes.map((rmt) => {
      remotesToLook.push({ id: [pncpl, BigInt(rmt.index)] });
    });
  });

  const state: ResQueryState = { ftSupplies: [], virtualAccounts: [], accounts: [], remoteAccounts: [] };

  try {
    const auxState = await actor.state({
      ftSupplies: nInfo.nFtAssets > BigInt(0) ? [{ idRange: [BigInt(0), [nInfo.nFtAssets - BigInt(1)]] }] : [],
      virtualAccounts:
        nInfo.nVirtualAccounts > BigInt(0) ? [{ idRange: [BigInt(0), [nInfo.nVirtualAccounts - BigInt(1)]] }] : [],
      accounts: nInfo.nAccounts > BigInt(0) ? [{ idRange: [BigInt(0), [nInfo.nAccounts - BigInt(1)]] }] : [],
      remoteAccounts: remotesToLook.length > 0 ? [{ cat: remotesToLook }] : [],
    });
    state.ftSupplies = auxState.ftSupplies;
    state.virtualAccounts = auxState.virtualAccounts;
    state.accounts = auxState.accounts;
    state.remoteAccounts = auxState.remoteAccounts as any;
  } catch (e) {
    console.log("errState", e);
  }

  try {
    const ftDict = store.getState().hpl.dictionaryHplFTs;
    let ftData = updateInfo ? await db().getHplAssets() : store.getState().hpl.hplFTsData;
    if (ftInfo && ftInfo.length > 0) {
      ftData = formatFtInfo(ftInfo, ftData);
      // localStorage.setItem(
      //   "hplFT-" + principal,
      //   JSON.stringify({
      //     ft: ftData,
      //   }),
      // );

      !fromReload && (await db().updateHplAssetsByLedger(ftData));
      store.dispatch(setHPLAssetsData(ftData));
    }
    let subData = updateInfo ? await db().getHplSubaccounts() : store.getState().hpl.hplSubsData;
    if (subAccInfo && subAccInfo.length > 0) {
      subData = formatAccountInfo(subAccInfo, subData);
      // localStorage.setItem(
      //   "hplSUB-" + principal,
      //   JSON.stringify({
      //     sub: subData,
      //   }),
      // );
      !fromReload && (await db().updateHplSubaccountsByLedger(subData));
      store.dispatch(setHPLSubsData(subData));
    }

    const myAgent = store.getState().auth.userAgent;

    const getMintPrinc = async (vtMintData: HPLVirtualData[]) => {
      if (!vtInfo) return [];
      const auxPric: string[] = [];
      vtInfo.map((vt) => {
        auxPric.push(vt[1][1].toText());
      });

      const mintPrinc = vtMintData
        .filter((vt) => vt.isMint)
        .map((vt) => {
          return vt.accesBy;
        });

      const checkPrinc = await Promise.all(
        auxPric
          .filter((item, index) => auxPric.indexOf(item) === index || !mintPrinc.includes(item))
          .map(async (vt) => {
            const canisterPrinc = vt;
            // HPL MINTER
            const mintActor = Actor.createActor<HplMintActor>(HplMintIDLFactory, {
              agent: myAgent,
              canisterId: canisterPrinc,
            });
            let isMint = false;
            try {
              isMint = await mintActor.isHplMinter();
            } catch {
              isMint = false;
            }
            if (isMint) return canisterPrinc;
          }),
      );

      return [...mintPrinc, ...checkPrinc];
    };
    if (vtInfo && vtInfo.length > 0) {
      const mintsAll = await getMintPrinc(vtData);
      const finalMints: string[] = [];
      mintsAll.map((mnt) => {
        if (mnt) finalMints.push(mnt);
      });

      vtData = formatVirtualAccountInfo(vtInfo, vtData, finalMints);
      // localStorage.setItem(
      //   "hplVT-" + principal,
      //   JSON.stringify({
      //     vt: vtData,
      //   }),
      // );

      !fromReload && (await db().updateHplVirtualsByLedger(vtData));
      store.dispatch(setHPLVTsData(vtData));
    }

    let myOwnerId = "";
    const ownerID = await owner.lookup(Principal.fromText(principal));
    if (ownerID[0]) {
      myOwnerId = ownerID[0].toString();
      store.dispatch(setOwnerId(myOwnerId));
    }

    let adminAccountState: Array<[bigint, { ft: bigint }]> = [];
    try {
      const adminState = await actor.adminState({
        ftSupplies: [],
        virtualAccounts: [],
        accounts: [{ idRange: [BigInt(0), []] }],
        remoteAccounts: [],
      });
      adminAccountState = adminState.accounts;
    } catch (e) {
      console.log("errState", e);
    }

    const { auxSubaccounts, auxFT, auxFullVirtuals } = formatHPLSubaccounts(
      { ft: ftData, sub: subData, vt: vtData },
      ftDict,
      state,
      adminAccountState,
      myOwnerId,
    );
    store.dispatch(setHPLSubAccounts(auxSubaccounts));
    store.dispatch(setHPLExchangeLinks(auxFullVirtuals));
    store.dispatch(setHPLAssets(auxFT));

    const selectedSub = store.getState().hpl.selectSub;
    if (selectedSub) {
      const sel = auxSubaccounts.find((sub) => sub.sub_account_id === selectedSub.sub_account_id);
      if (sel) store.dispatch(setHPLSelectedSub(sel));
    }

    updateHplRemotes(state, contacts);

    return { subs: auxSubaccounts, fts: auxFT };
  } catch (e) {
    console.log("err", e);
  }
  return { subs: [], fts: [] };
};

export const updateHplRemotes = async (auxState: ResQueryState, contacts: HplContact[]) => {
  try {
    const updatedContacts: HplContact[] = [];
    contacts.map((hplCntc) => {
      const updatedRemotes: HplRemote[] = [];
      hplCntc.remotes.map((rmt) => {
        const rmtFounded = auxState.remoteAccounts.find((auxRmt) => {
          return hplCntc.principal === auxRmt[0][0].toText() && auxRmt[0][1] === BigInt(rmt.index);
        });
        if (rmtFounded) {
          updatedRemotes.push({
            ...rmt,
            amount: rmtFounded[1][0].ft.toString(),
            expired: Math.trunc(Number(rmtFounded[1][1].toString()) / 1000000),
          });
        } else updatedRemotes.push(rmt);
      });
      updatedContacts.push({ ...hplCntc, remotes: updatedRemotes });
    });

    store.dispatch(setHplContacts(updatedContacts));
  } catch (e) {
    console.log("contacts-catch", contacts);
    store.dispatch(setHplContacts(contacts));
    console.log("errState-rem", e);
  }
};
export const getSNSTokens = async (agent: HttpAgent): Promise<Asset[]> => {
  let tokens: SnsToken[] = [];

  for (let index = 0; index < 100; index++) {
    try {
      const response = await fetch(`https://3r4gx-wqaaa-aaaaq-aaaia-cai.icp0.io/v1/sns/list/page/${index}/slow.json`);
      if (response.ok && response.status === 200) {
        const snses: SnsToken[] = await response.json();
        tokens = [...tokens, ...snses];
        if (snses.length < 10) break;
      } else {
        break;
      }
    } catch (error) {
      console.error("snses", error);
      break;
    }
  }

  const deduplicatedTokens: Asset[] = [];
  const symbolsAdded: string[] = [];

  await Promise.all(
    tokens.reverse().map(async (tkn, k) => {
      const metadata = getMetadataInfo(tkn.icrc1_metadata as IcrcTokenMetadataResponse);

      if (!symbolsAdded.includes(metadata.symbol)) {
        symbolsAdded.push(metadata.symbol);

        const supportedStandards = await getICRCSupportedStandards({
          assetAddress: tkn.canister_ids.ledger_canister_id,
          agent: agent,
        });

        deduplicatedTokens.push({
          sortIndex: 10005 + k,
          logo: metadata.logo !== "" ? metadata.logo : "https://3r4gx-wqaaa-aaaaq-aaaia-cai.ic0.app" + tkn.meta.logo,
          name: metadata.name,
          symbol: metadata.symbol,
          address: tkn.canister_ids.ledger_canister_id,
          decimal: metadata.decimals.toString(),
          shortDecimal: metadata.decimals.toString(),
          index: tkn.canister_ids.index_canister_id || "",
          tokenName: metadata.name,
          tokenSymbol: metadata.symbol,
          subAccounts: [
            {
              name: "Default",
              sub_account_id: "0",
              address: "",
              amount: "0",
              currency_amount: "0",
              transaction_fee: metadata.fee,
              decimal: 0,
              symbol: metadata.symbol,
            },
          ],
          supportedStandards: supportedStandards,
        });
      }
    }),
  );

  return deduplicatedTokens.reverse();
};
