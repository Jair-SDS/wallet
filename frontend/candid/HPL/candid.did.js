export const idlFactory = ({ IDL }) => {
  const RangedSubSelector = IDL.Variant({
    id: IDL.Nat,
    idRange: IDL.Tuple(IDL.Nat, IDL.Opt(IDL.Nat)),
  });
  const IdSelector = IDL.Variant({
    id: IDL.Nat,
    cat: IDL.Vec(RangedSubSelector),
    idRange: IDL.Tuple(IDL.Nat, IDL.Opt(IDL.Nat)),
  });
  const SubaccountId = IDL.Nat;
  const AssetId = IDL.Nat;
  const RangedSubSelector_1 = IDL.Variant({
    id: IDL.Tuple(IDL.Principal, IDL.Nat),
    idRange: IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Opt(IDL.Nat)),
  });
  const RemoteAccountSelector = IDL.Variant({
    id: IDL.Tuple(IDL.Principal, IDL.Nat),
    cat: IDL.Vec(RangedSubSelector_1),
    idRange: IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Opt(IDL.Nat)),
  });
  const Expiration = IDL.Nat64;
  const Asset = IDL.Tuple(AssetId, IDL.Nat);
  const Result_13 = IDL.Variant({
    ok: IDL.Vec(IDL.Record({ asset: Asset })),
    err: IDL.Variant({ UnknownPrincipal: IDL.Null }),
  });
  const PriorId = IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat);
  const NotPendingError = IDL.Variant({
    AlreadyApproved: IDL.Null,
    AlreadyRejected: IDL.Null,
    NoPart: IDL.Null,
    NotFound: IDL.Null,
    WrongAggregator: IDL.Null,
  });
  const Result_4 = IDL.Variant({ ok: IDL.Null, err: NotPendingError });
  const GlobalId = IDL.Tuple(IDL.Nat, IDL.Nat);
  const ApproveAndExecuteError = IDL.Variant({
    AlreadyApproved: IDL.Null,
    NotAController: IDL.Null,
    AlreadyRejected: IDL.Null,
    DeletedVirtualAccount: IDL.Null,
    UnknownPrincipal: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    NoPart: IDL.Null,
    MismatchInAsset: IDL.Null,
    UnsupportedFeeMode: IDL.Variant({
      SenderPaysMax: IDL.Null,
      FractionWrongFlowsAmount: IDL.Null,
    }),
    IncorrectOwnerId: IDL.Null,
    NotFound: IDL.Null,
    UnknownSubaccount: IDL.Null,
    NotApproved: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    WrongAggregator: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    UnknownFtAsset: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const Result_12 = IDL.Variant({
    ok: GlobalId,
    err: ApproveAndExecuteError,
  });
  const Result_11 = IDL.Variant({
    ok: AssetId,
    err: IDL.Variant({ NoSpace: IDL.Null, FeeError: IDL.Null }),
  });
  const VirtualAccountId = IDL.Nat;
  const Result_10 = IDL.Variant({
    ok: IDL.Vec(IDL.Variant({ ft: IDL.Nat })),
    err: IDL.Variant({
      DeletedVirtualAccount: IDL.Null,
      InvalidArguments: IDL.Text,
    }),
  });
  const Result_9 = IDL.Variant({
    ok: IDL.Vec(IDL.Int),
    err: IDL.Variant({
      DeletedVirtualAccount: IDL.Null,
      InvalidArguments: IDL.Text,
    }),
  });
  const ExecuteTxError = IDL.Variant({
    NotAController: IDL.Null,
    DeletedVirtualAccount: IDL.Null,
    UnknownPrincipal: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    NoPart: IDL.Null,
    MismatchInAsset: IDL.Null,
    UnsupportedFeeMode: IDL.Variant({
      SenderPaysMax: IDL.Null,
      FractionWrongFlowsAmount: IDL.Null,
    }),
    IncorrectOwnerId: IDL.Null,
    NotFound: IDL.Null,
    UnknownSubaccount: IDL.Null,
    NotApproved: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    WrongAggregator: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    UnknownFtAsset: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const Result_8 = IDL.Variant({ ok: GlobalId, err: ExecuteTxError });
  const FtInfo = IDL.Record({
    controller: IDL.Principal,
    decimals: IDL.Nat8,
    description: IDL.Text,
  });
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    status_code: IDL.Nat16,
  });
  const Result_7 = IDL.Variant({
    ok: IDL.Record({ first: SubaccountId }),
    err: IDL.Variant({
      InvalidArguments: IDL.Text,
      NoSpaceForPrincipal: IDL.Null,
      NoSpaceForSubaccount: IDL.Null,
    }),
  });
  const Result_6 = IDL.Variant({
    ok: IDL.Record({ first: VirtualAccountId }),
    err: IDL.Variant({
      InvalidArguments: IDL.Text,
      NoSpaceForAccount: IDL.Null,
    }),
  });
  const AssetDelta = IDL.Tuple(
    AssetId,
    IDL.Variant({
      maxIn: IDL.Null,
      maxOut: IDL.Null,
      amount: IDL.Int,
    }),
  );
  const Flow = IDL.Record({
    ownerIndex: IDL.Nat,
    account: IDL.Variant({
      air: IDL.Null,
      sub: SubaccountId,
      vir: IDL.Tuple(IDL.Principal, VirtualAccountId),
    }),
    delta: AssetDelta,
  });
  const FeeMode = IDL.Variant({
    receiverPays: IDL.Null,
    noFee: IDL.Null,
    senderPays: IDL.Null,
  });
  const Tx = IDL.Record({
    map: IDL.Vec(IDL.Principal),
    flows: IDL.Vec(Flow),
    memo: IDL.Vec(IDL.Vec(IDL.Nat8)),
    feeMode: FeeMode,
    mapIds: IDL.Vec(IDL.Opt(IDL.Nat)),
  });
  const Approvals = IDL.Vec(IDL.Bool);
  const TxProcessingError = IDL.Variant({
    NotAController: IDL.Null,
    DeletedVirtualAccount: IDL.Null,
    UnknownPrincipal: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    MismatchInAsset: IDL.Null,
    UnsupportedFeeMode: IDL.Variant({
      SenderPaysMax: IDL.Null,
      FractionWrongFlowsAmount: IDL.Null,
    }),
    IncorrectOwnerId: IDL.Null,
    UnknownSubaccount: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    UnknownFtAsset: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const PriorTxDetails = IDL.Record({
    tx: Tx,
    gid: IDL.Opt(GlobalId),
    status: IDL.Variant({
      pending: Approvals,
      rejected: IDL.Null,
      processed: GlobalId,
      failed: TxProcessingError,
    }),
    submitter: IDL.Principal,
  });
  const NotFoundError = IDL.Variant({
    NotFound: IDL.Null,
    WrongAggregator: IDL.Null,
  });
  const Result_5 = IDL.Variant({
    ok: PriorTxDetails,
    err: NotFoundError,
  });
  const ControlMessage = IDL.Variant({
    ok: IDL.Null,
    gap: IDL.Null,
    stop: IDL.Nat,
  });
  const PublicFeeMode = IDL.Variant({
    receiverPays: IDL.Null,
    senderPays: IDL.Null,
  });
  const SimpleTransferError = IDL.Variant({
    NotAController: IDL.Null,
    DeletedVirtualAccount: IDL.Null,
    TooLargeMemo: IDL.Null,
    UnknownPrincipal: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    MismatchInAsset: IDL.Null,
    UnsupportedFeeMode: IDL.Variant({
      SenderPaysMax: IDL.Null,
      FractionWrongFlowsAmount: IDL.Null,
    }),
    IncorrectOwnerId: IDL.Null,
    UnknownSubaccount: IDL.Null,
    NonZeroAssetSum: IDL.Null,
    UnsupportedMaxFlows: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    UnknownFtAsset: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const Result_3 = IDL.Variant({
    ok: IDL.Tuple(IDL.Nat, GlobalId),
    err: SimpleTransferError,
  });
  const Stats = IDL.Record({
    txs: IDL.Record({
      processed: IDL.Nat,
      failed: IDL.Nat,
      succeeded: IDL.Nat,
    }),
    canisterStatus: IDL.Record({
      heartbeats: IDL.Nat,
      cyclesBalance: IDL.Nat,
      memorySize: IDL.Nat,
    }),
    batchesProcessed: IDL.Nat,
    boardTxs: IDL.Record({
      forwarded: IDL.Nat,
      submitted: IDL.Nat,
      rejected: IDL.Nat,
    }),
    registry: IDL.Record({
      owners: IDL.Nat,
      assets: IDL.Nat,
      accounts: IDL.Nat,
      streams: IDL.Nat,
    }),
  });
  const AccountReference = IDL.Variant({
    sub: SubaccountId,
    vir: IDL.Tuple(IDL.Principal, VirtualAccountId),
  });
  const ContributionInput = IDL.Record({
    mints: IDL.Vec(Asset),
    owner: IDL.Opt(IDL.Principal),
    inflow: IDL.Vec(IDL.Tuple(AccountReference, Asset)),
    burns: IDL.Vec(Asset),
    outflow: IDL.Vec(IDL.Tuple(AccountReference, Asset)),
  });
  const TxInput = IDL.Variant({
    v1: IDL.Record({
      map: IDL.Vec(ContributionInput),
      memo: IDL.Vec(IDL.Vec(IDL.Nat8)),
    }),
  });
  const SubmitError = IDL.Variant({
    IncorrectOwnerIndex: IDL.Null,
    TooManyContributions: IDL.Null,
    NoSpace: IDL.Null,
    TooLargeMemo: IDL.Null,
    TooLargeFtQuantity: IDL.Null,
    TooLargeSubaccountId: IDL.Null,
    NonZeroAssetSum: IDL.Null,
    UnsupportedMaxFlows: IDL.Null,
    TooLargeVirtualAccountId: IDL.Null,
    TooManyFlows: IDL.Null,
    TooLargeAssetId: IDL.Null,
  });
  const Result_2 = IDL.Variant({ ok: PriorId, err: SubmitError });
  const TxOutput = IDL.Variant({
    ftTransfer: IDL.Record({ fee: IDL.Nat, amount: IDL.Nat }),
  });
  const SubmitAndExecuteError = IDL.Variant({
    IncorrectOwnerIndex: IDL.Null,
    NotAController: IDL.Null,
    TooManyContributions: IDL.Null,
    DeletedVirtualAccount: IDL.Null,
    TooLargeMemo: IDL.Null,
    TooLargeFtQuantity: IDL.Null,
    UnknownPrincipal: IDL.Null,
    TooLargeSubaccountId: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    MismatchInAsset: IDL.Null,
    UnsupportedFeeMode: IDL.Variant({
      SenderPaysMax: IDL.Null,
      FractionWrongFlowsAmount: IDL.Null,
    }),
    IncorrectOwnerId: IDL.Null,
    UnknownSubaccount: IDL.Null,
    NonZeroAssetSum: IDL.Null,
    UnsupportedMaxFlows: IDL.Null,
    NotApproved: IDL.Null,
    TooLargeVirtualAccountId: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    TooManyFlows: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    UnknownFtAsset: IDL.Null,
    TooLargeAssetId: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const Result_1 = IDL.Variant({
    ok: IDL.Tuple(GlobalId, TxOutput),
    err: SubmitAndExecuteError,
  });
  const TxFailureError = IDL.Variant({
    ftTransfer: IDL.Variant({
      DeletedVirtualAccount: IDL.Null,
      InvalidArguments: IDL.Text,
      InsufficientFunds: IDL.Null,
    }),
  });
  const TxResult = IDL.Variant({
    failure: TxFailureError,
    success: TxOutput,
  });
  const GidStatus = IDL.Variant({
    dropped: IDL.Record({}),
    awaited: IDL.Record({}),
    processed: IDL.Tuple(IDL.Opt(TxResult)),
  });
  const StateUpdate = IDL.Variant({
    ft_dec: IDL.Nat,
    ft_inc: IDL.Nat,
    ft_set: IDL.Nat,
  });
  const VirtualAccountUpdateObject = IDL.Record({
    backingAccount: IDL.Opt(SubaccountId),
    state: IDL.Opt(StateUpdate),
    expiration: IDL.Opt(Expiration),
  });
  const Result = IDL.Variant({
    ok: IDL.Vec(IDL.Variant({ ft: IDL.Tuple(IDL.Nat, IDL.Int) })),
    err: IDL.Variant({
      DeletedVirtualAccount: IDL.Null,
      InvalidArguments: IDL.Text,
      InsufficientFunds: IDL.Null,
    }),
  });
  return IDL.Service({
    accountInfo: IDL.Func([IdSelector], [IDL.Vec(IDL.Tuple(SubaccountId, IDL.Variant({ ft: AssetId })))], ["query"]),
    addAggregator: IDL.Func([IDL.Principal], [], []),
    adminAccountInfo: IDL.Func(
      [IdSelector],
      [IDL.Vec(IDL.Tuple(SubaccountId, IDL.Variant({ ft: AssetId })))],
      ["query"],
    ),
    adminState: IDL.Func(
      [
        IDL.Record({
          ftSupplies: IDL.Opt(IdSelector),
          virtualAccounts: IDL.Opt(IdSelector),
          accounts: IDL.Opt(IdSelector),
          remoteAccounts: IDL.Opt(RemoteAccountSelector),
        }),
      ],
      [
        IDL.Record({
          ftSupplies: IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
          virtualAccounts: IDL.Vec(
            IDL.Tuple(IDL.Nat, IDL.Tuple(IDL.Variant({ ft: IDL.Nat }), SubaccountId, Expiration)),
          ),
          accounts: IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Variant({ ft: IDL.Nat }))),
          remoteAccounts: IDL.Vec(
            IDL.Tuple(IDL.Tuple(IDL.Principal, IDL.Nat), IDL.Tuple(IDL.Variant({ ft: IDL.Nat }), Expiration)),
          ),
        }),
      ],
      ["query"],
    ),
    aggregators: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))], ["query"]),
    allAssets: IDL.Func([IDL.Principal], [Result_13], ["query"]),
    approve: IDL.Func([PriorId], [Result_4], []),
    approveAndExecute: IDL.Func([PriorId], [Result_12], []),
    createFungibleToken: IDL.Func([IDL.Nat8, IDL.Text], [Result_11], []),
    deleteVirtualAccounts: IDL.Func([IDL.Vec(VirtualAccountId)], [Result_10], []),
    emptyVirtualAccounts: IDL.Func([IDL.Vec(VirtualAccountId)], [Result_9], []),
    execute: IDL.Func([PriorId], [Result_8], []),
    feeRatio: IDL.Func([], [IDL.Nat], ["query"]),
    ftInfo: IDL.Func([IdSelector], [IDL.Vec(IDL.Tuple(AssetId, FtInfo))], ["query"]),
    ftSwapRate: IDL.Func([IdSelector], [IDL.Vec(IDL.Tuple(AssetId, IDL.Float64))], ["query"]),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
    issueTxStreamId: IDL.Func([IDL.Nat], [IDL.Nat, IDL.Nat64], []),
    nAccounts: IDL.Func([], [IDL.Nat], ["query"]),
    nAdminAccounts: IDL.Func([], [IDL.Nat], ["query"]),
    nFtAssets: IDL.Func([], [IDL.Nat], ["query"]),
    nStreams: IDL.Func([], [IDL.Nat], ["query"]),
    nVirtualAccounts: IDL.Func([], [IDL.Nat], ["query"]),
    openAccounts: IDL.Func([IDL.Vec(IDL.Variant({ ft: AssetId }))], [Result_7], []),
    openVirtualAccounts: IDL.Func(
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Variant({ ft: AssetId }),
            IDL.Principal,
            IDL.Variant({ ft: IDL.Nat }),
            SubaccountId,
            Expiration,
          ),
        ),
      ],
      [Result_6],
      [],
    ),
    owners_slice: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Vec(IDL.Principal)], ["query"]),
    ping: IDL.Func([], [IDL.Int], []),
    priorTxDetails: IDL.Func([PriorId], [Result_5], ["query"]),
    processBatch: IDL.Func([IDL.Nat, IDL.Vec(Tx), IDL.Nat], [IDL.Nat64, ControlMessage], []),
    pushFtRates: IDL.Func([IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Float64))], [], []),
    reject: IDL.Func([PriorId], [Result_4], []),
    remoteAccountInfo: IDL.Func(
      [RemoteAccountSelector],
      [IDL.Vec(IDL.Tuple(IDL.Tuple(IDL.Principal, IDL.Nat), IDL.Variant({ ft: AssetId })))],
      ["query"],
    ),
    removeAggregator: IDL.Func([IDL.Principal], [], []),
    requestAuctionFunds: IDL.Func([IDL.Principal, AssetId], [IDL.Vec(IDL.Tuple(AssetId, IDL.Nat))], []),
    simpleTransfer: IDL.Func(
      [
        IDL.Variant({
          sub: SubaccountId,
          vir: IDL.Tuple(IDL.Principal, VirtualAccountId),
          mint: IDL.Null,
        }),
        IDL.Variant({
          sub: SubaccountId,
          vir: IDL.Tuple(IDL.Principal, VirtualAccountId),
          mint: IDL.Null,
        }),
        AssetId,
        IDL.Variant({ max: IDL.Null, amount: IDL.Nat }),
        PublicFeeMode,
        IDL.Opt(IDL.Vec(IDL.Nat8)),
      ],
      [Result_3],
      [],
    ),
    state: IDL.Func(
      [
        IDL.Record({
          ftSupplies: IDL.Opt(IdSelector),
          virtualAccounts: IDL.Opt(IdSelector),
          accounts: IDL.Opt(IdSelector),
          remoteAccounts: IDL.Opt(RemoteAccountSelector),
        }),
      ],
      [
        IDL.Record({
          ftSupplies: IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
          virtualAccounts: IDL.Vec(
            IDL.Tuple(IDL.Nat, IDL.Tuple(IDL.Variant({ ft: IDL.Nat }), SubaccountId, Expiration)),
          ),
          accounts: IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Variant({ ft: IDL.Nat }))),
          remoteAccounts: IDL.Vec(
            IDL.Tuple(IDL.Tuple(IDL.Principal, IDL.Nat), IDL.Tuple(IDL.Variant({ ft: IDL.Nat }), Expiration)),
          ),
        }),
      ],
      ["query"],
    ),
    stats: IDL.Func([], [Stats], ["query"]),
    streamInfo: IDL.Func([IdSelector], [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Principal))], ["query"]),
    streamStatus: IDL.Func(
      [IdSelector],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Nat,
            IDL.Record({
              closed: IDL.Bool,
              source: IDL.Variant({
                internal: IDL.Null,
                aggregator: IDL.Principal,
              }),
              length: IDL.Nat,
              lastActive: IDL.Nat64,
            }),
          ),
        ),
      ],
      ["query"],
    ),
    submit: IDL.Func([TxInput], [Result_2], []),
    submitAndExecute: IDL.Func([TxInput], [Result_1], []),
    txStatus: IDL.Func([IDL.Vec(GlobalId)], [IDL.Vec(GidStatus)], ["query"]),
    updateVirtualAccounts: IDL.Func([IDL.Vec(IDL.Tuple(VirtualAccountId, VirtualAccountUpdateObject))], [Result], []),
    virtualAccountInfo: IDL.Func(
      [IdSelector],
      [IDL.Vec(IDL.Tuple(VirtualAccountId, IDL.Tuple(IDL.Variant({ ft: AssetId }), IDL.Principal)))],
      ["query"],
    ),
  });
};
export const init = ({ IDL }) => {
  return [];
};
