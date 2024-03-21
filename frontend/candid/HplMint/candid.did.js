export const idlFactory = ({ IDL }) => {
  const AssetId = IDL.Nat;
  const Result_9 = IDL.Variant({
    ok: AssetId,
    err: IDL.Variant({ UnknownToken: IDL.Null }),
  });
  const VirtualAccountId = IDL.Nat;
  const Subaccount = IDL.Vec(IDL.Nat8);
  const BurnError = IDL.Variant({
    IcrcTemporarilyUnavailable: IDL.Null,
    IcrcInsufficientFunds: IDL.Null,
    IcrcGenericError: IDL.Null,
    DeletedVirtualAccount: IDL.Null,
    UnknownPrincipal: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    MismatchInAsset: IDL.Null,
    CallLedgerError: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    TooLowQuantity: IDL.Null,
    CallIcrc1LedgerError: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    InsufficientFunds: IDL.Null,
    UnknownToken: IDL.Null,
  });
  const Result_8 = IDL.Variant({
    ok: IDL.Tuple(IDL.Nat, IDL.Nat),
    err: BurnError,
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
  const MintError = IDL.Variant({
    DeletedVirtualAccount: IDL.Null,
    UnknownPrincipal: IDL.Null,
    MismatchInRemotePrincipal: IDL.Null,
    MismatchInAsset: IDL.Null,
    InsufficientBalance: IDL.Null,
    CallLedgerError: IDL.Null,
    SuspendedVirtualAccount: IDL.Null,
    UnknownVirtualAccount: IDL.Null,
    UnknownToken: IDL.Null,
  });
  const Result_7 = IDL.Variant({ ok: IDL.Nat, err: MintError });
  const Time = IDL.Int;
  const Result_6 = IDL.Variant({
    ok: IDL.Tuple(IDL.Nat, IDL.Nat),
    err: IDL.Variant({
      GenericError: IDL.Record({
        message: IDL.Text,
        error_code: IDL.Nat,
      }),
      TemporarilyUnavailable: IDL.Null,
      BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
      Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
      CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
      TooOld: IDL.Null,
      TooLowQuantity: IDL.Null,
      CallIcrc1LedgerError: IDL.Null,
      InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
    }),
  });
  const GlobalId = IDL.Tuple(IDL.Nat, IDL.Nat);
  const Result_5 = IDL.Variant({
    ok: IDL.Tuple(IDL.Nat, GlobalId),
    err: IDL.Opt(
      IDL.Variant({
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
        CallLedgerError: IDL.Null,
        UnsupportedMaxFlows: IDL.Null,
        SuspendedVirtualAccount: IDL.Null,
        UnknownVirtualAccount: IDL.Null,
        UnknownFtAsset: IDL.Null,
        InsufficientFunds: IDL.Null,
      }),
    ),
  });
  const JournalRecord__1 = IDL.Tuple(
    Time,
    IDL.Principal,
    IDL.Text,
    IDL.Variant({
      withdraw: Result_6,
      burn: Result_5,
      mint: Result_5,
      burnWithdraw: Result_6,
    }),
  );
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  });
  const JournalRecord = IDL.Tuple(
    Time,
    IDL.Principal,
    IDL.Variant({
      withdraw: IDL.Record({ to: Account, amount: IDL.Nat }),
      debited: IDL.Nat,
      error: IDL.Text,
      consolidationError: IDL.Variant({
        GenericError: IDL.Record({
          message: IDL.Text,
          error_code: IDL.Nat,
        }),
        TemporarilyUnavailable: IDL.Null,
        BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
        Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
        BadFee: IDL.Record({ expected_fee: IDL.Nat }),
        CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
        TooOld: IDL.Null,
        CallIcrc1LedgerError: IDL.Null,
        InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
      }),
      newDeposit: IDL.Nat,
      feeUpdated: IDL.Record({ new: IDL.Nat, old: IDL.Nat }),
      consolidated: IDL.Record({
        deducted: IDL.Nat,
        credited: IDL.Nat,
      }),
      credited: IDL.Nat,
    }),
  );
  const Result_4 = IDL.Variant({
    ok: IDL.Tuple(IDL.Vec(JournalRecord), IDL.Nat),
    err: IDL.Opt(IDL.Variant({ UnknownToken: IDL.Null })),
  });
  const ExchangeRatio = IDL.Tuple(IDL.Nat, IDL.Nat);
  const SharedMintTokenData = IDL.Record({
    icrc1Ledger: IDL.Principal,
    assetId: AssetId,
    exchangeRatio: ExchangeRatio,
    symbol: IDL.Text,
  });
  const Result_3 = IDL.Variant({
    ok: SharedMintTokenData,
    err: IDL.Variant({
      NoSpace: IDL.Null,
      FeeError: IDL.Null,
      CallLedgerError: IDL.Null,
      PermissionDenied: IDL.Null,
      AlreadyExists: IDL.Null,
    }),
  });
  const Stats = IDL.Record({
    tokens: IDL.Vec(IDL.Record({ backlogSize: IDL.Nat, symbol: IDL.Text })),
  });
  const Result_2 = IDL.Variant({
    ok: SharedMintTokenData,
    err: IDL.Opt(IDL.Variant({ UnknownToken: IDL.Null })),
  });
  const Result_1 = IDL.Variant({
    ok: IDL.Nat,
    err: IDL.Variant({ UnknownToken: IDL.Null }),
  });
  const WithdrawCreditError = IDL.Variant({
    IcrcTemporarilyUnavailable: IDL.Null,
    IcrcInsufficientFunds: IDL.Null,
    IcrcGenericError: IDL.Null,
    NoCredit: IDL.Null,
    CallIcrc1LedgerError: IDL.Null,
    UnknownToken: IDL.Null,
  });
  const Result = IDL.Variant({
    ok: IDL.Tuple(IDL.Nat, IDL.Nat),
    err: WithdrawCreditError,
  });
  return IDL.Service({
    assetId: IDL.Func([IDL.Text], [Result_9], ["query"]),
    burnAndWithdraw: IDL.Func(
      [IDL.Text, VirtualAccountId, IDL.Nat, IDL.Tuple(IDL.Principal, IDL.Opt(Subaccount))],
      [Result_8],
      [],
    ),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
    init: IDL.Func([], [], []),
    isFrozen: IDL.Func([IDL.Text], [IDL.Opt(IDL.Bool)], ["query"]),
    isHplMinter: IDL.Func([], [IDL.Bool], ["query"]),
    mint: IDL.Func(
      [IDL.Text, IDL.Tuple(IDL.Principal, VirtualAccountId), IDL.Variant({ max: IDL.Null, amount: IDL.Nat })],
      [Result_7],
      [],
    ),
    notify: IDL.Func([IDL.Text, IDL.Principal], [IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat))], []),
    notifyAndMint: IDL.Func([IDL.Nat, VirtualAccountId], [Result_7], []),
    principalToSubaccount: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Vec(IDL.Nat8))], ["query"]),
    queryIcrc1Journal: IDL.Func([IDL.Opt(IDL.Nat)], [IDL.Vec(JournalRecord__1), IDL.Nat], ["query"]),
    queryTokenHandlerJournal: IDL.Func([IDL.Text, IDL.Opt(IDL.Nat)], [Result_4], ["query"]),
    registerFt: IDL.Func([IDL.Principal, IDL.Text, ExchangeRatio, IDL.Nat8, IDL.Text], [Result_3], []),
    stats: IDL.Func([], [Stats], ["query"]),
    tokenInfo: IDL.Func([IDL.Text], [Result_2], ["query"]),
    usableBalance: IDL.Func([IDL.Text, IDL.Principal], [Result_1], ["query"]),
    withdrawCredit: IDL.Func([IDL.Text, IDL.Tuple(IDL.Principal, IDL.Opt(Subaccount))], [Result], []),
  });
};
export const init = ({ IDL }) => {
  return [];
};
