import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export interface AllowanceDocument {
  id: string;
  deleted: boolean;
  asset: {
    logo: string;
    name: string;
    tokenSymbol: string;
    supportedStandards: Array<string>;
    address: string;
    tokenName: string;
    decimal: string;
    symbol: string;
  };
  updatedAt: number;
  subAccountId: string;
  spender: string;
}
export interface AssetDocument {
  deleted: boolean;
  logo: string;
  name: string;
  tokenSymbol: string;
  updatedAt: number;
  supportedStandards: Array<string>;
  address: string;
  tokenName: string;
  index: string;
  sortIndex: number;
  shortDecimal: string;
  decimal: string;
  subAccounts: Array<{
    transaction_fee: string;
    currency_amount: string;
    name: string;
    sub_account_id: string;
    address: string;
    amount: string;
    decimal: number;
    symbol: string;
  }>;
  symbol: string;
}
export interface ContactDocument {
  principal: string;
  deleted: boolean;
  name: string;
  assets: Array<{
    subaccounts: Array<{
      name: string;
      sub_account_id: string;
      subaccount_index: string;
    }>;
    logo: string;
    tokenSymbol: string;
    supportedStandards: Array<string>;
    address: string;
    shortDecimal: string;
    decimal: string;
    symbol: string;
  }>;
  updatedAt: number;
  accountIdentier: string;
}
export interface HplAssetDocument {
  id: string;
  controller: string;
  decimals: string;
  name: string;
  description: string;
  updatedAt: number;
  symbol: string;
}
export interface HplContactDocument {
  principal: string;
  name: string;
  updatedAt: number;
  remotes: Array<{
    status: string;
    expired: string;
    code: string;
    ftIndex: string;
    name: string;
    index: string;
    amount: string;
  }>;
}
export interface HplCountDocument {
  nAccounts: string;
  principal: string;
  nVirtualAccounts: string;
  updatedAt: number;
  nFtAssets: string;
}
export interface HplSubAccountDocument {
  id: string;
  ftId: string;
  name: string;
  updatedAt: number;
}
export interface HplVirtualDocument {
  id: string;
  ftId: string;
  name: string;
  isMint: string;
  updatedAt: number;
  accesBy: string;
}
export interface WalletDatabase {
  doesStorageExist: ActorMethod<[], boolean>;
  dump: ActorMethod<
    [],
    Array<
      [
        Principal,
        [
          Array<[] | [AssetDocument]>,
          Array<[] | [ContactDocument]>,
          Array<[] | [AllowanceDocument]>,
          Array<[] | [HplSubAccountDocument]>,
          Array<[] | [HplVirtualDocument]>,
          Array<[] | [HplAssetDocument]>,
          Array<[] | [HplCountDocument]>,
          Array<[] | [HplContactDocument]>,
        ],
      ]
    >
  >;
  pullAllowances: ActorMethod<[number, [] | [string], bigint], Array<AllowanceDocument>>;
  pullAssets: ActorMethod<[number, [] | [string], bigint], Array<AssetDocument>>;
  pullContacts: ActorMethod<[number, [] | [string], bigint], Array<ContactDocument>>;
  pullHplAssets: ActorMethod<[number, [] | [string], bigint], Array<HplAssetDocument>>;
  pullHplContacts: ActorMethod<[number, [] | [string], bigint], Array<HplContactDocument>>;
  pullHplCount: ActorMethod<[number, [] | [string], bigint], Array<HplCountDocument>>;
  pullHplSubaccounts: ActorMethod<[number, [] | [string], bigint], Array<HplSubAccountDocument>>;
  pullHplVirtuals: ActorMethod<[number, [] | [string], bigint], Array<HplVirtualDocument>>;
  pushAllowances: ActorMethod<[Array<AllowanceDocument>], Array<AllowanceDocument>>;
  pushAssets: ActorMethod<[Array<AssetDocument>], Array<AssetDocument>>;
  pushContacts: ActorMethod<[Array<ContactDocument>], Array<ContactDocument>>;
  pushHplAssets: ActorMethod<[Array<HplAssetDocument>], Array<HplAssetDocument>>;
  pushHplContacts: ActorMethod<[Array<HplContactDocument>], Array<HplContactDocument>>;
  pushHplCount: ActorMethod<[Array<HplCountDocument>], Array<HplCountDocument>>;
  pushHplSubaccounts: ActorMethod<[Array<HplSubAccountDocument>], Array<HplSubAccountDocument>>;
  pushHplVirtuals: ActorMethod<[Array<HplVirtualDocument>], Array<HplVirtualDocument>>;
}
export type _SERVICE = WalletDatabase;
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];
