import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export interface Account {
  owner: Principal;
  subaccount: [] | [Subaccount];
}
export type AssetId = bigint;
export type BurnError =
  | { IcrcTemporarilyUnavailable: null }
  | { IcrcInsufficientFunds: null }
  | { IcrcGenericError: null }
  | { DeletedVirtualAccount: null }
  | { UnknownPrincipal: null }
  | { MismatchInRemotePrincipal: null }
  | { MismatchInAsset: null }
  | { CallLedgerError: null }
  | { SuspendedVirtualAccount: null }
  | { TooLowQuantity: null }
  | { CallIcrc1LedgerError: null }
  | { UnknownVirtualAccount: null }
  | { InsufficientFunds: null }
  | { UnknownToken: null };
export type ExchangeRatio = [bigint, bigint];
export type GlobalId = [bigint, bigint];
export interface HttpRequest {
  url: string;
  method: string;
  body: Uint8Array | number[];
  headers: Array<[string, string]>;
}
export interface HttpResponse {
  body: Uint8Array | number[];
  headers: Array<[string, string]>;
  status_code: number;
}
export type JournalRecord = [
  Time,
  Principal,
  (
    | { withdraw: { to: Account; amount: bigint } }
    | { debited: bigint }
    | { error: string }
    | {
        consolidationError:
          | {
              GenericError: { message: string; error_code: bigint };
            }
          | { TemporarilyUnavailable: null }
          | { BadBurn: { min_burn_amount: bigint } }
          | { Duplicate: { duplicate_of: bigint } }
          | { BadFee: { expected_fee: bigint } }
          | { CreatedInFuture: { ledger_time: bigint } }
          | { TooOld: null }
          | { CallIcrc1LedgerError: null }
          | { InsufficientFunds: { balance: bigint } };
      }
    | { newDeposit: bigint }
    | { feeUpdated: { new: bigint; old: bigint } }
    | { consolidated: { deducted: bigint; credited: bigint } }
    | { credited: bigint }
  ),
];
export type JournalRecord__1 = [
  Time,
  Principal,
  string,
  { withdraw: Result_6 } | { burn: Result_5 } | { mint: Result_5 } | { burnWithdraw: Result_6 },
];
export type MintError =
  | { DeletedVirtualAccount: null }
  | { UnknownPrincipal: null }
  | { MismatchInRemotePrincipal: null }
  | { MismatchInAsset: null }
  | { InsufficientBalance: null }
  | { CallLedgerError: null }
  | { SuspendedVirtualAccount: null }
  | { UnknownVirtualAccount: null }
  | { UnknownToken: null };
export type Result = { ok: [bigint, bigint] } | { err: WithdrawCreditError };
export type Result_1 = { ok: bigint } | { err: { UnknownToken: null } };
export type Result_2 = { ok: SharedMintTokenData } | { err: [] | [{ UnknownToken: null }] };
export type Result_3 =
  | { ok: SharedMintTokenData }
  | {
      err:
        | { NoSpace: null }
        | { FeeError: null }
        | { CallLedgerError: null }
        | { PermissionDenied: null }
        | { AlreadyExists: null };
    };
export type Result_4 = { ok: [Array<JournalRecord>, bigint] } | { err: [] | [{ UnknownToken: null }] };
export type Result_5 =
  | { ok: [bigint, GlobalId] }
  | {
      err:
        | []
        | [
            | { NotAController: null }
            | { DeletedVirtualAccount: null }
            | { TooLargeMemo: null }
            | { UnknownPrincipal: null }
            | { MismatchInRemotePrincipal: null }
            | { MismatchInAsset: null }
            | {
                UnsupportedFeeMode: { SenderPaysMax: null } | { FractionWrongFlowsAmount: null };
              }
            | { IncorrectOwnerId: null }
            | { UnknownSubaccount: null }
            | { NonZeroAssetSum: null }
            | { CallLedgerError: null }
            | { UnsupportedMaxFlows: null }
            | { SuspendedVirtualAccount: null }
            | { UnknownVirtualAccount: null }
            | { UnknownFtAsset: null }
            | { InsufficientFunds: null },
          ];
    };
export type Result_6 =
  | { ok: [bigint, bigint] }
  | {
      err:
        | { GenericError: { message: string; error_code: bigint } }
        | { TemporarilyUnavailable: null }
        | { BadBurn: { min_burn_amount: bigint } }
        | { Duplicate: { duplicate_of: bigint } }
        | { BadFee: { expected_fee: bigint } }
        | { CreatedInFuture: { ledger_time: bigint } }
        | { TooOld: null }
        | { TooLowQuantity: null }
        | { CallIcrc1LedgerError: null }
        | { InsufficientFunds: { balance: bigint } };
    };
export type Result_7 = { ok: bigint } | { err: MintError };
export type Result_8 = { ok: [bigint, bigint] } | { err: BurnError };
export type Result_9 = { ok: AssetId } | { err: { UnknownToken: null } };
export interface SharedMintTokenData {
  icrc1Ledger: Principal;
  assetId: AssetId;
  exchangeRatio: ExchangeRatio;
  symbol: string;
}
export interface Stats {
  tokens: Array<{ backlogSize: bigint; symbol: string }>;
}
export type Subaccount = Uint8Array | number[];
export type Time = bigint;
export type VirtualAccountId = bigint;
export type WithdrawCreditError =
  | { IcrcTemporarilyUnavailable: null }
  | { IcrcInsufficientFunds: null }
  | { IcrcGenericError: null }
  | { NoCredit: null }
  | { CallIcrc1LedgerError: null }
  | { UnknownToken: null };
export interface _SERVICE {
  assetId: ActorMethod<[string], Result_9>;
  burnAndWithdraw: ActorMethod<[string, VirtualAccountId, bigint, [Principal, [] | [Subaccount]]], Result_8>;
  http_request: ActorMethod<[HttpRequest], HttpResponse>;
  init: ActorMethod<[], undefined>;
  isFrozen: ActorMethod<[string], [] | [boolean]>;
  isHplMinter: ActorMethod<[], boolean>;
  mint: ActorMethod<[string, [Principal, VirtualAccountId], { max: null } | { amount: bigint }], Result_7>;
  notify: ActorMethod<[string, Principal], [] | [[bigint, bigint]]>;
  notifyAndMint: ActorMethod<[bigint, VirtualAccountId], Result_7>;
  principalToSubaccount: ActorMethod<[Principal], [] | [Uint8Array | number[]]>;
  queryIcrc1Journal: ActorMethod<[[] | [bigint]], [Array<JournalRecord__1>, bigint]>;
  queryTokenHandlerJournal: ActorMethod<[string, [] | [bigint]], Result_4>;
  registerFt: ActorMethod<[Principal, string, ExchangeRatio, number, string], Result_3>;
  stats: ActorMethod<[], Stats>;
  tokenInfo: ActorMethod<[string], Result_2>;
  usableBalance: ActorMethod<[string, Principal], Result_1>;
  withdrawCredit: ActorMethod<[string, [Principal, [] | [Subaccount]]], Result>;
}
