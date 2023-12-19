/* eslint-disable no-empty */
import { ActorSubclass, HttpAgent } from "@dfinity/agent";
import store from "@redux/Store";
import { Token, TokenMarketInfo, TokenSubAccount } from "@redux/models/TokenModels";
import { IcrcAccount, IcrcIndexCanister, IcrcLedgerCanister } from "@dfinity/ledger";
import {
  formatIcpTransaccion,
  getSubAccountArray,
  getMetadataInfo,
  formatckBTCTransaccion,
  getUSDfromToken,
  hexToUint8Array,
  hexToNumber,
  formatHPLSubaccounts,
} from "@/utils";
import {
  setAssets,
  setTransactions,
  setTokenMarket,
  setICPSubaccounts,
  setHPLSubAccounts,
  setHPLAssets,
  setHPLSelectedSub,
  setLoading,
  setAcordeonAssetIdx,
  setnHpl,
} from "./AssetReducer";
import { AccountIdentifier, SubAccount as SubAccountNNS } from "@dfinity/nns";
import {
  Asset,
  HplContact,
  HplRemote,
  ICPSubAccount,
  ResQueryState,
  SubAccount,
  nHplData,
} from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { AccountDefaultEnum } from "@/const";
import bigInt from "big-integer";
import { AccountType, AssetId, SubId, VirId } from "@research-ag/hpl-client/dist/candid/ledger";
import { _SERVICE as IngressActor, RemoteId } from "@candid/HPL/service.did";
import { setHplContacts } from "@redux/contacts/ContactsReducer";

export const updateAllBalances = async (
  loading: boolean,
  myAgent: HttpAgent,
  tokens: Token[],
  basicSearch?: boolean,
  fromLogin?: boolean,
) => {
  let tokenMarkets: TokenMarketInfo[] = [];
  try {
    const auxTokenMarkets: TokenMarketInfo[] = await fetch(import.meta.env.VITE_APP_TOKEN_MARKET).then((x) => x.json());
    tokenMarkets = auxTokenMarkets.filter((x) => !x.unreleased);
  } catch {
    tokenMarkets = [];
  }

  try {
    const ethRate = await fetch(import.meta.env.VITE_APP_ETH_MARKET).then((x) => x.json());
    tokenMarkets = [
      ...tokenMarkets,
      {
        id: 999,
        name: "Ethereum",
        symbol: "ckETH",
        price: ethRate.USD,
        marketcap: 0,
        volume24: 0,
        circulating: 0,
        total: 0,
        liquidity: 0,
        unreleased: 0,
      },
    ];
  } catch {
    //
  }
  store.dispatch(setTokenMarket(tokenMarkets));

  const myPrincipal = await myAgent.getPrincipal();
  const tokensAseets = await Promise.all(
    tokens.map(async (tkn, idNum) => {
      try {
        const { balance, metadata, transactionFee } = IcrcLedgerCanister.create({
          agent: myAgent,
          canisterId: tkn.address as any,
        });

        const [myMetadata, myTransactionFee] = await Promise.all([
          metadata({
            certified: false,
          }),
          transactionFee({
            certified: false,
          }),
        ]);

        const { decimals, name, symbol, logo } = getMetadataInfo(myMetadata);

        const assetMarket = tokenMarkets.find((tm) => tm.symbol === symbol);
        const subAccList: SubAccount[] = [];
        const userSubAcc: TokenSubAccount[] = [];

        let subAccts: { saAsset: SubAccount; saToken: TokenSubAccount }[] = [];

        // Basic Serach look into first 1000 subaccount under the 5 consecutive zeros logic
        // It iterates geting amount of each subaccount
        // If 5 consecutive subaccounts balances are zero, iteration stops
        if (basicSearch) {
          let zeros = 0;
          for (let i = 0; i < 1000; i++) {
            const myBalance = await balance({
              owner: myPrincipal,
              subaccount: new Uint8Array(getSubAccountArray(i)),
              certified: false,
            });
            if (Number(myBalance) > 0 || i === 0) {
              zeros = 0;
              subAccList.push({
                name: i === 0 ? AccountDefaultEnum.Values.Default : "-",
                sub_account_id: `0x${i.toString(16)}`,
                address: myPrincipal.toString(),
                amount: myBalance.toString(),
                currency_amount: assetMarket ? getUSDfromToken(myBalance.toString(), assetMarket.price, decimals) : "0",
                transaction_fee: myTransactionFee.toString(),
                decimal: decimals,
                symbol: tkn.symbol,
              });
              userSubAcc.push({
                name: i === 0 ? AccountDefaultEnum.Values.Default : "-",
                numb: `0x${i.toString(16)}`,
                amount: myBalance.toString(),
                currency_amount: assetMarket ? getUSDfromToken(myBalance.toString(), assetMarket.price, decimals) : "0",
              });
            } else zeros++;

            if (zeros === 5) break;
          }
        } else {
          // Non Basic Serach first look into storaged subaccounts
          // Then search into first 1000 subaccount that are not looked yet under the 5 consecutive zeros logic
          // It iterates geting amount of each subaccount
          // If 5 consecutive subaccounts balances are zero, iteration stops
          subAccts = await Promise.all(
            tkn.subAccounts.map(async (sa) => {
              const myBalance = await balance({
                owner: myPrincipal,
                subaccount: new Uint8Array(hexToUint8Array(sa.numb)),
                certified: false,
              });

              const amnt = myBalance.toString();
              const crncyAmnt = assetMarket ? getUSDfromToken(myBalance.toString(), assetMarket.price, decimals) : "0";
              const saAsset: SubAccount = {
                name: sa.name,
                sub_account_id: sa.numb,
                address: myPrincipal.toString(),
                amount: amnt,
                currency_amount: crncyAmnt,
                transaction_fee: myTransactionFee.toString(),
                decimal: decimals,
                symbol: tkn.symbol,
              };
              const saToken: TokenSubAccount = {
                name: sa.name,
                numb: sa.numb,
                amount: amnt,
                currency_amount: crncyAmnt,
              };

              return { saAsset, saToken };
            }),
          );
        }
        const saTokens = subAccts.map((saT) => {
          return saT.saToken;
        });
        const saAssets = subAccts.map((saA) => {
          return saA.saAsset;
        });
        const newToken: Token = {
          ...tkn,
          logo: logo,
          tokenName: name,
          tokenSymbol: symbol,
          decimal: decimals.toFixed(0),
          subAccounts: (basicSearch ? userSubAcc : saTokens).sort((a, b) => {
            return hexToNumber(a.numb)?.compare(hexToNumber(b.numb) || bigInt()) || 0;
          }),
        };
        const newAsset: Asset = {
          symbol: tkn.symbol,
          name: tkn.name,
          address: tkn.address,
          index: tkn.index,
          subAccounts: (basicSearch ? subAccList : saAssets).sort((a, b) => {
            return hexToNumber(a.sub_account_id)?.compare(hexToNumber(b.sub_account_id) || bigInt()) || 0;
          }),
          sort_index: idNum,
          decimal: decimals.toFixed(0),
          tokenName: name,
          tokenSymbol: symbol,
          logo: logo,
        };
        return { newToken, newAsset };
      } catch (e) {
        const newAsset: Asset = {
          symbol: tkn.symbol,
          name: tkn.name,
          address: tkn.address,
          index: tkn.index,
          subAccounts: [
            {
              name: AccountDefaultEnum.Values.Default,
              sub_account_id: "0x0",
              address: myPrincipal.toString(),
              amount: "0",
              currency_amount: "0",
              transaction_fee: "0",
              decimal: 8,
              symbol: tkn.symbol,
            },
          ],
          decimal: "8",
          sort_index: 99999 + idNum,
          tokenName: tkn.name,
          tokenSymbol: tkn.symbol,
        };
        return { newToken: tkn, newAsset };
      }
    }),
  );
  const newAssetsUpload = tokensAseets.map((tA) => {
    return tA.newAsset;
  });
  const newTokensUpload = tokensAseets.map((tA) => {
    return tA.newToken;
  });
  if (loading) {
    store.dispatch(setAssets(newAssetsUpload));
    if (newTokensUpload.length !== 0) {
      localStorage.setItem(
        myPrincipal.toString(),
        JSON.stringify({
          from: "II",
          tokens: newTokensUpload.sort((a, b) => {
            return a.id_number - b.id_number;
          }),
        }),
      );
    }
    if (fromLogin) {
      newAssetsUpload.length > 0 && store.dispatch(setAcordeonAssetIdx([newAssetsUpload[0].tokenSymbol]));
    }
  }

  const icpAsset = newAssetsUpload.find((ast) => ast.tokenSymbol === "ICP");
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

  store.dispatch(setLoading(false));
  return {
    newAssetsUpload,
    tokens: newTokensUpload.sort((a, b) => {
      return a.id_number - b.id_number;
    }),
  };
};

export const updateHPLBalances = async (
  actor: ActorSubclass<IngressActor>,
  contacts: HplContact[],
  fromWorker?: boolean,
) => {
  // Get amounts nAccounts, nVirtualAccounts, nFtAssets
  const nHpl = store.getState().asset.nHpl;
  const nInfo = {
    nAccounts: BigInt(nHpl?.nAccounts || 0),
    nVirtualAccounts: BigInt(nHpl?.nVirtualAccounts || 0),
    nFtAssets: BigInt(nHpl?.nFtAssets || 0),
  };
  if (!fromWorker) {
    try {
      const [nAccounts, nVirtualAccounts, nFtAssets] = await Promise.all([
        actor.nAccounts(),
        actor.nVirtualAccounts(),
        actor.nFtAssets(),
      ]);
      store.dispatch(
        setnHpl({
          nAccounts: nAccounts.toString(),
          nVirtualAccounts: nVirtualAccounts.toString(),
          nFtAssets: nFtAssets.toString(),
        }),
      );
      nInfo.nAccounts = nAccounts;
      nInfo.nVirtualAccounts = nVirtualAccounts;
      nInfo.nFtAssets = nFtAssets;
    } catch (e) {
      console.log("err-nHpl", e);
    }
  }

  let subAccInfo: Array<[SubId, AccountType]> = [];
  if (nInfo.nAccounts > BigInt(0))
    try {
      subAccInfo = await actor.accountInfo({ idRange: [BigInt(0), []] });
    } catch (e) {
      console.log("errAccountInfo", e);
    }

  let ftInfo: Array<
    [
      AssetId,
      {
        controller: Principal;
        decimals: number;
        description: string;
      },
    ]
  > = [];

  if (nInfo.nFtAssets > BigInt(0))
    try {
      ftInfo = await actor.ftInfo({ idRange: [BigInt(0), []] });
    } catch (e) {
      console.log("errFtInfor", e);
    }

  let vtInfo: Array<[VirId, [AccountType, Principal]]> = [];

  if (nInfo.nVirtualAccounts > BigInt(0))
    try {
      vtInfo = await actor.virtualAccountInfo({ idRange: [BigInt(0), []] });
    } catch (e) {
      console.log("errVirtualAccountInfo", e);
    }

  const remotesToLook: { id: RemoteId }[] = [];
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
    const ftDict = store.getState().asset.dictionaryHplFTs;
    const ftData = store.getState().asset.hplFTsData;
    const subData = store.getState().asset.hplSubsData;
    const vtData = store.getState().asset.hplVTsData;

    const { auxSubaccounts, auxFT } = formatHPLSubaccounts(
      subAccInfo,
      ftInfo,
      vtInfo,
      { ft: ftData, sub: subData, vt: vtData },
      ftDict,
      state,
    );

    store.dispatch(setHPLSubAccounts(auxSubaccounts));
    store.dispatch(setHPLAssets(auxFT));

    const selectedSub = store.getState().asset.selectSub;
    if (selectedSub) {
      const sel = auxSubaccounts.find((sub) => sub.sub_account_id === selectedSub.sub_account_id);
      store.dispatch(setHPLSelectedSub(sel));
    }
    updateHplRemotes(state, contacts);

    return { subs: auxSubaccounts, fts: auxFT };
  } catch (e) {
    console.log("err", e);
  }
  return { subs: [], fts: [] };
};

export const updateHplRemotes = async (auxState: ResQueryState, contacts?: HplContact[]) => {
  if (contacts) {
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
      store.dispatch(setHplContacts(contacts));
      console.log("errState-rem", e);
    }
  }
};

export const setAssetFromLocalData = (tokens: Token[], myPrincipal: string) => {
  const assets: Asset[] = [];

  tokens.map((tkn) => {
    const subAccList: SubAccount[] = [];
    tkn.subAccounts.map((sa) => {
      subAccList.push({
        name: sa.name,
        sub_account_id: sa.numb,
        address: myPrincipal,
        amount: sa.amount || "0",
        currency_amount: sa.currency_amount || "0",
        transaction_fee: tkn.fee || "0",
        decimal: Number(tkn.decimal),
        symbol: tkn.symbol,
      });
    });

    assets.push({
      symbol: tkn.symbol,
      name: tkn.name,
      address: tkn.address,
      index: tkn.index,
      subAccounts: subAccList.sort((a, b) => {
        return hexToNumber(a.sub_account_id)?.compare(hexToNumber(b.sub_account_id) || bigInt()) || 0;
      }),
      sort_index: tkn.id_number,
      decimal: tkn.decimal,
      tokenName: tkn.tokenName,
      tokenSymbol: tkn.tokenSymbol,
      logo: tkn.logo,
    });
  });

  store.dispatch(setAssets(assets));
};

export const getAllTransactionsICP = async (subaccount_index: string, loading: boolean, isOGY: boolean) => {
  const myAgent = store.getState().auth.userAgent;
  const myPrincipal = await myAgent.getPrincipal();
  let subacc: SubAccountNNS | undefined = undefined;
  try {
    subacc = SubAccountNNS.fromBytes(hexToUint8Array(subaccount_index)) as SubAccountNNS;
  } catch {
    subacc = undefined;
  }

  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: myPrincipal,
    subAccount: subacc,
  });
  try {
    const response = await fetch(
      `${isOGY ? import.meta.env.VITE_ROSETTA_URL_OGY : import.meta.env.VITE_ROSETTA_URL}/search/transactions`,
      {
        method: "POST",
        // mode: "no-cors",
        body: JSON.stringify({
          network_identifier: {
            blockchain: isOGY ? import.meta.env.VITE_NET_ID_BLOCKCHAIN_OGY : import.meta.env.VITE_NET_ID_BLOCKCHAIN,
            network: isOGY ? import.meta.env.VITE_NET_ID_NETWORK_OGY : import.meta.env.VITE_NET_ID_NETWORK,
          },
          account_identifier: {
            address: accountIdentifier.toHex(),
          },
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      },
    ).catch();
    if (!response.ok) throw Error(`${response.statusText}`);
    const { transactions } = await response.json();
    const transactionsInfo = transactions.map(({ transaction }: any) =>
      formatIcpTransaccion(accountIdentifier.toHex(), transaction),
    );

    if (loading) {
      store.dispatch(setTransactions(transactionsInfo));
    } else {
      return transactionsInfo;
    }
  } catch (error) {
    if (!loading) {
      return [];
    }
  }
};

export const getAllTransactionsICRC1 = async (
  canister_id: any,
  subaccount_index: Uint8Array,
  loading: boolean,
  assetSymbol: string,
  canister: string,
  subNumber?: string,
) => {
  try {
    const myAgent = store.getState().auth.userAgent;
    const myPrincipal = await myAgent.getPrincipal();
    const canisterPrincipal = Principal.fromText(canister_id);

    const { getTransactions: ICRC1_getTransactions } = IcrcIndexCanister.create({
      agent: myAgent,
      canisterId: canisterPrincipal,
    });

    const ICRC1getTransactions = await ICRC1_getTransactions({
      account: {
        owner: myPrincipal,
        subaccount: subaccount_index,
      } as IcrcAccount,
      max_results: BigInt(100),
    });

    const transactionsInfo = ICRC1getTransactions.transactions.map(({ transaction, id }) =>
      formatckBTCTransaccion(transaction, id, myPrincipal.toString(), assetSymbol, canister, subNumber),
    );
    if (
      loading &&
      store.getState().asset.selectedAccount?.sub_account_id === subNumber &&
      assetSymbol === store.getState().asset.selectedAsset?.tokenSymbol
    ) {
      store.dispatch(setTransactions(transactionsInfo));
      return transactionsInfo;
    } else {
      return transactionsInfo;
    }
  } catch {
    store.dispatch(setTransactions([]));
    return [];
  }
};
