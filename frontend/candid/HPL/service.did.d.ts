import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

export type AccountReference = { sub: SubaccountId } | { vir: [Principal, VirtualAccountId] };
export type Approvals = Array<boolean>;
export type ApproveAndExecuteError =
  | { AlreadyApproved: null }
  | { NotAController: null }
  | { AlreadyRejected: null }
  | { DeletedVirtualAccount: null }
  | { UnknownPrincipal: null }
  | { MismatchInRemotePrincipal: null }
  | { NoPart: null }
  | { MismatchInAsset: null }
  | {
      UnsupportedFeeMode: { SenderPaysMax: null } | { FractionWrongFlowsAmount: null };
    }
  | { IncorrectOwnerId: null }
  | { NotFound: null }
  | { UnknownSubaccount: null }
  | { NotApproved: null }
  | { SuspendedVirtualAccount: null }
  | { WrongAggregator: null }
  | { UnknownVirtualAccount: null }
  | { UnknownFtAsset: null }
  | { InsufficientFunds: null };
export type Asset = [AssetId, bigint];
export type AssetDelta = [AssetId, { maxIn: null } | { maxOut: null } | { amount: bigint }];
export type AssetId = bigint;
export interface ContributionInput {
  mints: Array<Asset>;
  owner: [] | [Principal];
  inflow: Array<[AccountReference, Asset]>;
  burns: Array<Asset>;
  outflow: Array<[AccountReference, Asset]>;
}
export type ControlMessage = { ok: null } | { gap: null } | { stop: bigint };
export type ExecuteTxError =
  | { NotAController: null }
  | { DeletedVirtualAccount: null }
  | { UnknownPrincipal: null }
  | { MismatchInRemotePrincipal: null }
  | { NoPart: null }
  | { MismatchInAsset: null }
  | {
      UnsupportedFeeMode: { SenderPaysMax: null } | { FractionWrongFlowsAmount: null };
    }
  | { IncorrectOwnerId: null }
  | { NotFound: null }
  | { UnknownSubaccount: null }
  | { NotApproved: null }
  | { SuspendedVirtualAccount: null }
  | { WrongAggregator: null }
  | { UnknownVirtualAccount: null }
  | { UnknownFtAsset: null }
  | { InsufficientFunds: null };
export type Expiration = bigint;
export type FeeMode = { receiverPays: null } | { noFee: null } | { senderPays: null };
export interface Flow {
  ownerIndex: bigint;
  account: { air: null } | { sub: SubaccountId } | { vir: [Principal, VirtualAccountId] };
  delta: AssetDelta;
}
export interface FtInfo {
  controller: Principal;
  decimals: number;
  description: string;
}
export type GidStatus = { dropped: object } | { awaited: object } | { processed: [[] | [TxResult]] };
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
export type IdSelector = { id: bigint } | { cat: Array<RangedSubSelector> } | { idRange: [bigint, [] | [bigint]] };
export type NotFoundError = { NotFound: null } | { WrongAggregator: null };
export type NotPendingError =
  | { AlreadyApproved: null }
  | { AlreadyRejected: null }
  | { NoPart: null }
  | { NotFound: null }
  | { WrongAggregator: null };
export type PriorId = [bigint, bigint, bigint];
export interface PriorTxDetails {
  tx: Tx;
  gid: [] | [GlobalId];
  status: { pending: Approvals } | { rejected: null } | { processed: GlobalId } | { failed: TxProcessingError };
  submitter: Principal;
}
export type PublicFeeMode = { receiverPays: null } | { senderPays: null };
export type RangedSubSelector = { id: bigint } | { idRange: [bigint, [] | [bigint]] };
export type RangedSubSelector_1 = { id: [Principal, bigint] } | { idRange: [Principal, bigint, [] | [bigint]] };
export type RemoteAccountSelector =
  | { id: [Principal, bigint] }
  | { cat: Array<RangedSubSelector_1> }
  | { idRange: [Principal, bigint, [] | [bigint]] };
export type Result =
  | { ok: Array<{ ft: [bigint, bigint] }> }
  | {
      err: { DeletedVirtualAccount: null } | { InvalidArguments: string } | { InsufficientFunds: null };
    };
export type Result_1 = { ok: [GlobalId, TxOutput] } | { err: SubmitAndExecuteError };
export type Result_10 =
  | { ok: Array<{ ft: bigint }> }
  | {
      err: { DeletedVirtualAccount: null } | { InvalidArguments: string };
    };
export type Result_11 = { ok: AssetId } | { err: { NoSpace: null } | { FeeError: null } };
export type Result_12 = { ok: GlobalId } | { err: ApproveAndExecuteError };
export type Result_13 = { ok: Array<{ asset: Asset }> } | { err: { UnknownPrincipal: null } };
export type Result_2 = { ok: PriorId } | { err: SubmitError };
export type Result_3 = { ok: [bigint, GlobalId] } | { err: SimpleTransferError };
export type Result_4 = { ok: null } | { err: NotPendingError };
export type Result_5 = { ok: PriorTxDetails } | { err: NotFoundError };
export type Result_6 =
  | { ok: { first: VirtualAccountId } }
  | { err: { InvalidArguments: string } | { NoSpaceForAccount: null } };
export type Result_7 =
  | { ok: { first: SubaccountId } }
  | {
      err: { InvalidArguments: string } | { NoSpaceForPrincipal: null } | { NoSpaceForSubaccount: null };
    };
export type Result_8 = { ok: GlobalId } | { err: ExecuteTxError };
export type Result_9 =
  | { ok: Array<bigint> }
  | {
      err: { DeletedVirtualAccount: null } | { InvalidArguments: string };
    };
export type SimpleTransferError =
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
  | { UnsupportedMaxFlows: null }
  | { SuspendedVirtualAccount: null }
  | { UnknownVirtualAccount: null }
  | { UnknownFtAsset: null }
  | { InsufficientFunds: null };
export type StateUpdate = { ft_dec: bigint } | { ft_inc: bigint } | { ft_set: bigint };
export interface Stats {
  txs: { processed: bigint; failed: bigint; succeeded: bigint };
  canisterStatus: {
    heartbeats: bigint;
    cyclesBalance: bigint;
    memorySize: bigint;
  };
  batchesProcessed: bigint;
  boardTxs: {
    forwarded: bigint;
    submitted: bigint;
    rejected: bigint;
  };
  registry: {
    owners: bigint;
    assets: bigint;
    accounts: bigint;
    streams: bigint;
  };
}
export type SubaccountId = bigint;
export type SubmitAndExecuteError =
  | { IncorrectOwnerIndex: null }
  | { NotAController: null }
  | { TooManyContributions: null }
  | { DeletedVirtualAccount: null }
  | { TooLargeMemo: null }
  | { TooLargeFtQuantity: null }
  | { UnknownPrincipal: null }
  | { TooLargeSubaccountId: null }
  | { MismatchInRemotePrincipal: null }
  | { MismatchInAsset: null }
  | {
      UnsupportedFeeMode: { SenderPaysMax: null } | { FractionWrongFlowsAmount: null };
    }
  | { IncorrectOwnerId: null }
  | { UnknownSubaccount: null }
  | { NonZeroAssetSum: null }
  | { UnsupportedMaxFlows: null }
  | { NotApproved: null }
  | { TooLargeVirtualAccountId: null }
  | { SuspendedVirtualAccount: null }
  | { TooManyFlows: null }
  | { UnknownVirtualAccount: null }
  | { UnknownFtAsset: null }
  | { TooLargeAssetId: null }
  | { InsufficientFunds: null };
export type SubmitError =
  | { IncorrectOwnerIndex: null }
  | { TooManyContributions: null }
  | { NoSpace: null }
  | { TooLargeMemo: null }
  | { TooLargeFtQuantity: null }
  | { TooLargeSubaccountId: null }
  | { NonZeroAssetSum: null }
  | { UnsupportedMaxFlows: null }
  | { TooLargeVirtualAccountId: null }
  | { TooManyFlows: null }
  | { TooLargeAssetId: null };
export interface Tx {
  map: Array<Principal>;
  flows: Array<Flow>;
  memo: Array<Uint8Array | number[]>;
  feeMode: FeeMode;
  mapIds: Array<[] | [bigint]>;
}
export type TxFailureError = {
  ftTransfer: { DeletedVirtualAccount: null } | { InvalidArguments: string } | { InsufficientFunds: null };
};
export type TxInput = {
  v1: {
    map: Array<ContributionInput>;
    memo: Array<Uint8Array | number[]>;
  };
};
export type TxOutput = { ftTransfer: { fee: bigint; amount: bigint } };
export type TxProcessingError =
  | { NotAController: null }
  | { DeletedVirtualAccount: null }
  | { UnknownPrincipal: null }
  | { MismatchInRemotePrincipal: null }
  | { MismatchInAsset: null }
  | {
      UnsupportedFeeMode: { SenderPaysMax: null } | { FractionWrongFlowsAmount: null };
    }
  | { IncorrectOwnerId: null }
  | { UnknownSubaccount: null }
  | { SuspendedVirtualAccount: null }
  | { UnknownVirtualAccount: null }
  | { UnknownFtAsset: null }
  | { InsufficientFunds: null };
export type TxResult = { failure: TxFailureError } | { success: TxOutput };
export type VirtualAccountId = bigint;
export interface VirtualAccountUpdateObject {
  backingAccount: [] | [SubaccountId];
  state: [] | [StateUpdate];
  expiration: [] | [Expiration];
}
export interface _SERVICE {
  accountInfo: ActorMethod<[IdSelector], Array<[SubaccountId, { ft: AssetId }]>>;
  addAggregator: ActorMethod<[Principal], undefined>;
  adminAccountInfo: ActorMethod<[IdSelector], Array<[SubaccountId, { ft: AssetId }]>>;
  adminState: ActorMethod<
    [
      {
        ftSupplies: [] | [IdSelector];
        virtualAccounts: [] | [IdSelector];
        accounts: [] | [IdSelector];
        remoteAccounts: [] | [RemoteAccountSelector];
      },
    ],
    {
      ftSupplies: Array<[bigint, bigint]>;
      virtualAccounts: Array<[bigint, [{ ft: bigint }, SubaccountId, Expiration]]>;
      accounts: Array<[bigint, { ft: bigint }]>;
      remoteAccounts: Array<[[Principal, bigint], [{ ft: bigint }, Expiration]]>;
    }
  >;
  aggregators: ActorMethod<[], Array<[Principal, bigint]>>;
  allAssets: ActorMethod<[Principal], Result_13>;
  approve: ActorMethod<[PriorId], Result_4>;
  approveAndExecute: ActorMethod<[PriorId], Result_12>;
  createFungibleToken: ActorMethod<[number, string], Result_11>;
  deleteVirtualAccounts: ActorMethod<[Array<VirtualAccountId>], Result_10>;
  emptyVirtualAccounts: ActorMethod<[Array<VirtualAccountId>], Result_9>;
  execute: ActorMethod<[PriorId], Result_8>;
  feeRatio: ActorMethod<[], bigint>;
  ftInfo: ActorMethod<[IdSelector], Array<[AssetId, FtInfo]>>;
  ftSwapRate: ActorMethod<[IdSelector], Array<[AssetId, number]>>;
  http_request: ActorMethod<[HttpRequest], HttpResponse>;
  issueTxStreamId: ActorMethod<[bigint], [bigint, bigint]>;
  nAccounts: ActorMethod<[], bigint>;
  nAdminAccounts: ActorMethod<[], bigint>;
  nFtAssets: ActorMethod<[], bigint>;
  nStreams: ActorMethod<[], bigint>;
  nVirtualAccounts: ActorMethod<[], bigint>;
  openAccounts: ActorMethod<[Array<{ ft: AssetId }>], Result_7>;
  openVirtualAccounts: ActorMethod<
    [Array<[{ ft: AssetId }, Principal, { ft: bigint }, SubaccountId, Expiration]>],
    Result_6
  >;
  owners_slice: ActorMethod<[bigint, bigint], Array<Principal>>;
  ping: ActorMethod<[], bigint>;
  priorTxDetails: ActorMethod<[PriorId], Result_5>;
  processBatch: ActorMethod<[bigint, Array<Tx>, bigint], [bigint, ControlMessage]>;
  reject: ActorMethod<[PriorId], Result_4>;
  remoteAccountInfo: ActorMethod<[RemoteAccountSelector], Array<[[Principal, bigint], { ft: AssetId }]>>;
  removeAggregator: ActorMethod<[Principal], undefined>;
  requestAuctionFunds: ActorMethod<[AssetId], Array<[AssetId, bigint]>>;
  simpleTransfer: ActorMethod<
    [
      { sub: SubaccountId } | { vir: [Principal, VirtualAccountId] } | { mint: null },
      { sub: SubaccountId } | { vir: [Principal, VirtualAccountId] } | { mint: null },
      AssetId,
      { max: null } | { amount: bigint },
      PublicFeeMode,
      [] | [Uint8Array | number[]],
    ],
    Result_3
  >;
  state: ActorMethod<
    [
      {
        ftSupplies: [] | [IdSelector];
        virtualAccounts: [] | [IdSelector];
        accounts: [] | [IdSelector];
        remoteAccounts: [] | [RemoteAccountSelector];
      },
    ],
    {
      ftSupplies: Array<[bigint, bigint]>;
      virtualAccounts: Array<[bigint, [{ ft: bigint }, SubaccountId, Expiration]]>;
      accounts: Array<[bigint, { ft: bigint }]>;
      remoteAccounts: Array<[[Principal, bigint], [{ ft: bigint }, Expiration]]>;
    }
  >;
  stats: ActorMethod<[], Stats>;
  streamInfo: ActorMethod<[IdSelector], Array<[bigint, Principal]>>;
  streamStatus: ActorMethod<
    [IdSelector],
    Array<
      [
        bigint,
        {
          closed: boolean;
          source: { internal: null } | { aggregator: Principal };
          length: bigint;
          lastActive: bigint;
        },
      ]
    >
  >;
  submit: ActorMethod<[TxInput], Result_2>;
  submitAndExecute: ActorMethod<[TxInput], Result_1>;
  txStatus: ActorMethod<[Array<GlobalId>], Array<GidStatus>>;
  updateVirtualAccounts: ActorMethod<[Array<[VirtualAccountId, VirtualAccountUpdateObject]>], Result>;
  virtualAccountInfo: ActorMethod<[IdSelector], Array<[VirtualAccountId, [{ ft: AssetId }, Principal]]>>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
