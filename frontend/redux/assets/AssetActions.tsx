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
} from "./AssetReducer";
import { AccountIdentifier, SubAccount as SubAccountNNS } from "@dfinity/nns";
import { Asset, ICPSubAccount, ResQueryState, SubAccount } from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { AccountDefaultEnum } from "@/const";
import bigInt from "big-integer";
import { AccountType, AssetId, SubId, VirId } from "@research-ag/hpl-client/dist/candid/ledger";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";

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
  const newTokens: Token[] = [];
  const assets: Asset[] = [];
  await Promise.all(
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
              });
            } else zeros++;

            if (zeros === 5) break;
          }
        } else {
          // Non Basic Serach first look into storaged subaccounts
          // Then search into first 1000 subaccount that are not looked yet under the 5 consecutive zeros logic
          // It iterates geting amount of each subaccount
          // If 5 consecutive subaccounts balances are zero, iteration stops
          await Promise.all(
            tkn.subAccounts.map(async (sa) => {
              const myBalance = await balance({
                owner: myPrincipal,
                subaccount: new Uint8Array(hexToUint8Array(sa.numb)),
                certified: false,
              });
              subAccList.push({
                name: sa.name,
                sub_account_id: sa.numb,
                address: myPrincipal.toString(),
                amount: myBalance.toString(),
                currency_amount: assetMarket ? getUSDfromToken(myBalance.toString(), assetMarket.price, decimals) : "0",
                transaction_fee: myTransactionFee.toString(),
                decimal: decimals,
                symbol: tkn.symbol,
              });
              userSubAcc.push({
                name: sa.name,
                numb: sa.numb,
              });
            }),
          );
        }
        newTokens.push({
          ...tkn,
          logo: logo,
          decimal: decimals.toFixed(0),
          subAccounts: userSubAcc.sort((a, b) => {
            return hexToNumber(a.numb)?.compare(hexToNumber(b.numb) || bigInt()) || 0;
          }),
        });

        assets.push({
          symbol: tkn.symbol,
          name: tkn.name,
          address: tkn.address,
          index: tkn.index,
          subAccounts: subAccList.sort((a, b) => {
            return hexToNumber(a.sub_account_id)?.compare(hexToNumber(b.sub_account_id) || bigInt()) || 0;
          }),
          sort_index: idNum,
          decimal: decimals.toFixed(0),
          tokenName: name,
          tokenSymbol: symbol,
          logo: logo,
        });
      } catch (e) {
        assets.push({
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
        });
        newTokens.push(tkn);
      }
    }),
  );

  if (loading) {
    store.dispatch(setAssets(assets));
    if (newTokens.length !== 0) {
      localStorage.setItem(
        myPrincipal.toString(),
        JSON.stringify({
          from: "II",
          tokens: newTokens.sort((a, b) => {
            return a.id_number - b.id_number;
          }),
        }),
      );
    }
    if (fromLogin) {
      assets.length > 0 && store.dispatch(setAcordeonAssetIdx([assets[0].tokenSymbol]));
    }
  }

  const icpAsset = assets.find((ast) => ast.tokenSymbol === "ICP");
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
    assets,
    tokens: newTokens.sort((a, b) => {
      return a.id_number - b.id_number;
    }),
  };
};

export const updateHPLBalances = async (actor: ActorSubclass<IngressActor>) => {
  let subAccInfo: Array<[SubId, AccountType]> = [];
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
  try {
    ftInfo = await actor.ftInfo({ idRange: [BigInt(0), []] });
  } catch (e) {
    console.log("errFtInfor", e);
  }
  let vtInfo: Array<[VirId, [AccountType, Principal]]> = [];
  try {
    vtInfo = await actor.virtualAccountInfo({ idRange: [BigInt(0), []] });
  } catch (e) {
    console.log("errVirtualAccountInfo", e);
  }
  const state: ResQueryState = { ftSupplies: [], virtualAccounts: [], accounts: [], remoteAccounts: [] };
  try {
    const auxState = await actor.state({
      ftSupplies: [{ idRange: [BigInt(0), []] }],
      virtualAccounts: [],
      accounts: [],
      remoteAccounts: [],
    });
    state.ftSupplies = auxState.ftSupplies;
  } catch (e) {
    console.log("errState-ft", e);
  }
  try {
    const auxState = await actor.state({
      ftSupplies: [],
      virtualAccounts: [{ idRange: [BigInt(0), []] }],
      accounts: [],
      remoteAccounts: [],
    });
    state.virtualAccounts = auxState.virtualAccounts;
  } catch (e) {
    console.log("errState-vt", e);
  }
  try {
    const auxState = await actor.state({
      ftSupplies: [],
      virtualAccounts: [],
      accounts: [{ idRange: [BigInt(0), []] }],
      remoteAccounts: [],
    });
    state.accounts = auxState.accounts;
  } catch (e) {
    console.log("errState-sub", e);
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

    return { subs: auxSubaccounts, fts: auxFT };
  } catch (e) {
    console.log("err", e);
  }
  return { subs: [], fts: [] };
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
