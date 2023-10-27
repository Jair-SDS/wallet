import { HplTransactionsEnum, OperationStatusEnum, OperationTypeEnum, TransactionTypeEnum } from "@/const";
import { Principal } from "@dfinity/principal";
import { AssetId, SubId, VirId } from "@research-ag/hpl-client/dist/candid/ledger";
import { JsAccountState } from "@research-ag/hpl-client/dist/types/delegates/types";
import { z } from "zod";

// ICRC1 Models
const SubAccount = z.object({
  name: z.string(),
  sub_account_id: z.string(),
  address: z.string(),
  amount: z.string(),
  currency_amount: z.string(),
  transaction_fee: z.string(),
  decimal: z.number(),
  symbol: z.string(),
});

export type SubAccount = z.infer<typeof SubAccount>;

const ICPSubAccount = z.object({
  legacy: z.string(),
  sub_account_id: z.string(),
});

export type ICPSubAccount = z.infer<typeof ICPSubAccount>;

const Asset = z.object({
  logo: z.string().optional(),
  name: z.string(),
  symbol: z.string(),
  subAccounts: z.array(SubAccount),
  address: z.string(),
  decimal: z.string(),
  sort_index: z.number(),
  index: z.string().optional(),
  tokenName: z.string(),
  tokenSymbol: z.string(),
});

export type Asset = z.infer<typeof Asset>;

const Transaction = z.object({
  idx: z.string().optional(),
  hash: z.string().optional(),
  timestamp: z.number(),
  from: z.string().optional(),
  fromSub: z.string().optional(),
  to: z.string().optional(),
  toSub: z.string().optional(),
  fee: z.string().optional(),
  amount: z.string(),
  canisterId: z.string().optional(),
  status: OperationStatusEnum,
  type: TransactionTypeEnum,
  symbol: z.string(),
  identityTo: z.string().optional(),
  identityFrom: z.string().optional(),
});

export type Transaction = z.infer<typeof Transaction>;

// Rosetta Transaction
const Operation = z.object({
  account: z.object({
    address: z.string(),
  }),
  amount: z.object({
    value: z.string(),
    currency: z.object({
      symbol: z.string(),
      decimals: z.number(),
    }),
  }),
  operation_identifier: z.object({
    index: z.number(),
  }),
  status: OperationStatusEnum,
  type: OperationTypeEnum,
});

export type Operation = z.infer<typeof Operation>;

const RosettaTransaction = z.object({
  metadata: z.object({
    block_height: z.number(),
    memo: z.number(),
    timestamp: z.number(),
    lockTime: z.number(),
  }),
  operations: z.array(Operation),
  transaction_identifier: z.object({
    hash: z.string(),
  }),
});

export type RosettaTransaction = z.infer<typeof RosettaTransaction>;

// Local Storage
const TransactionList = z.object({
  symbol: z.string(),
  tokenSymbol: z.string(),
  subaccount: z.string(),
  tx: z.array(Transaction),
});

export type TransactionList = z.infer<typeof TransactionList>;

// HPL Models
const HPLVirtualSubAcc = z.object({
  virt_sub_acc_id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency_amount: z.string(),
  expiration: z.number(),
  accesBy: z.string(),
  backing: z.string(),
});

export type HPLVirtualSubAcc = z.infer<typeof HPLVirtualSubAcc>;

const HPLSubAccount = z.object({
  sub_account_id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency_amount: z.string(),
  transaction_fee: z.string(),
  ft: z.string(),
  virtuals: z.array(HPLVirtualSubAcc),
});

export type HPLSubAccount = z.infer<typeof HPLSubAccount>;

const HPLAsset = z.object({
  id: z.string(),
  name: z.string(),
  token_name: z.string(),
  symbol: z.string(),
  token_symbol: z.string(),
  decimal: z.number(),
  description: z.string(),
  logo: z.string(),
});

export type HPLAsset = z.infer<typeof HPLAsset>;

export interface ResQueryState {
  ftSupplies: Array<[AssetId, bigint]>;
  virtualAccounts: Array<
    [
      VirId,
      {
        state: JsAccountState;
        backingSubaccountId: bigint;
        expiration: bigint;
      } | null,
    ]
  >;
  accounts: Array<[SubId, JsAccountState]>;
  remoteAccounts: Array<
    [
      [Principal, VirId],
      {
        state: JsAccountState;
        expiration: bigint;
      } | null,
    ]
  >;
}

const HPLAssetData = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
});

export type HPLAssetData = z.infer<typeof HPLAssetData>;

const HPLSubData = z.object({
  id: z.string(),
  name: z.string(),
});

export type HPLSubData = z.infer<typeof HPLSubData>;

const HPLVirtualData = z.object({
  id: z.string(),
  name: z.string(),
});

export type HPLVirtualData = z.infer<typeof HPLVirtualData>;

const HPLData = z.object({
  ft: z.array(HPLAssetData),
  sub: z.array(HPLSubData),
  vt: z.array(HPLVirtualData),
});

export type HPLData = z.infer<typeof HPLData>;

const HplRemote = z.object({
  name: z.string(),
  index: z.string(),
  status: z.string(),
  expired: z.number(),
  amount: z.string(),
  ftIndex: z.string(),
});
export type HplRemote = z.infer<typeof HplRemote>;

const HplContact = z.object({
  principal: z.string(),
  name: z.string(),
  remotes: z.array(HplRemote),
});
export type HplContact = z.infer<typeof HplContact>;

const HplTxUser = z.object({
  type: HplTransactionsEnum,
  principal: z.string(),
  vIdx: z.string(),
  subaccount: HPLSubAccount.optional(),
  remote: HplRemote.optional(),
});
export type HplTxUser = z.infer<typeof HplTxUser>;

// Process Interfaces
const AssetToAdd = z.object({
  symbol: z.string(),
  tokenSymbol: z.string(),
  logo: z.string().optional(),
});
export type AssetToAdd = z.infer<typeof AssetToAdd>;
