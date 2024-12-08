export const idlFactory = ({ IDL }) => {
  const OrderId = IDL.Nat;
  const OrderId__1 = IDL.Nat;
  const CancellationResult = IDL.Tuple(OrderId__1, IDL.Principal, IDL.Nat, IDL.Float64);
  const CancelOrderError = IDL.Variant({
    UnknownOrder: IDL.Null,
    UnknownPrincipal: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
  });
  const UpperResult_4 = IDL.Variant({
    Ok: CancellationResult,
    Err: CancelOrderError,
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
  const DepositResult = IDL.Variant({
    Ok: IDL.Record({
      credit_inc: IDL.Nat,
      txid: IDL.Nat,
      credit: IDL.Int,
    }),
    Err: IDL.Variant({
      TransferError: IDL.Record({ message: IDL.Text }),
      AmountBelowMinimum: IDL.Record({}),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    }),
  });
  const NotifyResult = IDL.Variant({
    Ok: IDL.Record({
      credit_inc: IDL.Nat,
      credit: IDL.Int,
      deposit_inc: IDL.Nat,
    }),
    Err: IDL.Variant({
      NotAvailable: IDL.Record({ message: IDL.Text }),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
    }),
  });
  const TokenInfo = IDL.Record({
    allowance_fee: IDL.Nat,
    withdrawal_fee: IDL.Nat,
    deposit_fee: IDL.Nat,
  });
  const WithdrawResult = IDL.Variant({
    Ok: IDL.Record({ txid: IDL.Nat, amount: IDL.Nat }),
    Err: IDL.Variant({
      AmountBelowMinimum: IDL.Record({}),
      InsufficientCredit: IDL.Record({}),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    }),
  });
  const IndicativeStats = IDL.Record({
    clearing: IDL.Variant({
      match: IDL.Record({ volume: IDL.Nat, price: IDL.Float64 }),
      noMatch: IDL.Record({
        minAskPrice: IDL.Opt(IDL.Float64),
        maxBidPrice: IDL.Opt(IDL.Float64),
      }),
    }),
    totalAskVolume: IDL.Nat,
    totalBidVolume: IDL.Nat,
  });
  const InternalPlaceOrderError = IDL.Variant({
    ConflictingOrder: IDL.Tuple(IDL.Variant({ ask: IDL.Null, bid: IDL.Null }), IDL.Opt(OrderId__1)),
    UnknownAsset: IDL.Null,
    NoCredit: IDL.Null,
    VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
    TooLowOrder: IDL.Null,
    PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
  });
  const ManageOrdersError = IDL.Variant({
    placement: IDL.Record({
      error: InternalPlaceOrderError,
      index: IDL.Nat,
    }),
    UnknownPrincipal: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
    cancellation: IDL.Record({
      error: IDL.Variant({
        UnknownAsset: IDL.Null,
        UnknownOrder: IDL.Null,
      }),
      index: IDL.Nat,
    }),
  });
  const UpperResult_3 = IDL.Variant({
    Ok: IDL.Tuple(IDL.Vec(CancellationResult), IDL.Vec(OrderId)),
    Err: ManageOrdersError,
  });
  const PlaceOrderError = IDL.Variant({
    ConflictingOrder: IDL.Tuple(IDL.Variant({ ask: IDL.Null, bid: IDL.Null }), IDL.Opt(OrderId__1)),
    UnknownAsset: IDL.Null,
    NoCredit: IDL.Null,
    UnknownPrincipal: IDL.Null,
    VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
    TooLowOrder: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
    PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
  });
  const UpperResult_2 = IDL.Variant({
    Ok: OrderId,
    Err: PlaceOrderError,
  });
  const Order = IDL.Record({
    icrc1Ledger: IDL.Principal,
    volume: IDL.Nat,
    price: IDL.Float64,
  });
  const CreditInfo = IDL.Record({
    total: IDL.Nat,
    locked: IDL.Nat,
    available: IDL.Nat,
  });
  const DepositHistoryItem = IDL.Tuple(
    IDL.Nat64,
    IDL.Variant({
      deposit: IDL.Null,
      withdrawal: IDL.Null,
      withdrawalRollback: IDL.Null,
    }),
    IDL.Principal,
    IDL.Nat,
  );
  const UserOrder = IDL.Record({
    user: IDL.Principal,
    volume: IDL.Nat,
    price: IDL.Float64,
  });
  const PriceHistoryItem = IDL.Tuple(IDL.Nat64, IDL.Nat, IDL.Principal, IDL.Nat, IDL.Float64);
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  });
  const DepositFromAllowance = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    InsufficientAllowance: IDL.Record({ allowance: IDL.Nat }),
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    CallIcrc1LedgerError: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const TransferMin = IDL.Variant({
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
  });
  const Withdraw = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    InsufficientCredit: IDL.Null,
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    TooLowQuantity: IDL.Null,
    CallIcrc1LedgerError: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const LogEvent = IDL.Variant({
    withdraw: IDL.Record({ to: Account, amount: IDL.Nat }),
    allowanceError: DepositFromAllowance,
    surchargeUpdated: IDL.Record({ new: IDL.Nat, old: IDL.Nat }),
    debited: IDL.Nat,
    error: IDL.Text,
    consolidationError: TransferMin,
    issued: IDL.Int,
    allowanceDrawn: IDL.Record({ amount: IDL.Nat }),
    newDeposit: IDL.Nat,
    feeUpdated: IDL.Record({ new: IDL.Nat, old: IDL.Nat }),
    consolidated: IDL.Record({ deducted: IDL.Nat, credited: IDL.Nat }),
    burned: IDL.Nat,
    withdrawalError: Withdraw,
    credited: IDL.Nat,
  });
  const TransactionHistoryItem = IDL.Tuple(
    IDL.Nat64,
    IDL.Nat,
    IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
    IDL.Principal,
    IDL.Nat,
    IDL.Float64,
  );
  const RegisterAssetError = IDL.Variant({ AlreadyRegistered: IDL.Null });
  const UpperResult_1 = IDL.Variant({
    Ok: IDL.Nat,
    Err: RegisterAssetError,
  });
  const ReplaceOrderError = IDL.Variant({
    ConflictingOrder: IDL.Tuple(IDL.Variant({ ask: IDL.Null, bid: IDL.Null }), IDL.Opt(OrderId__1)),
    UnknownAsset: IDL.Null,
    UnknownOrder: IDL.Null,
    NoCredit: IDL.Null,
    UnknownPrincipal: IDL.Null,
    VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
    TooLowOrder: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
    PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
  });
  const UpperResult = IDL.Variant({
    Ok: OrderId,
    Err: ReplaceOrderError,
  });
  return IDL.Service({
    addAdmin: IDL.Func([IDL.Principal], [], []),
    cancelAsks: IDL.Func([IDL.Vec(OrderId), IDL.Opt(IDL.Nat)], [IDL.Vec(UpperResult_4)], []),
    cancelBids: IDL.Func([IDL.Vec(OrderId), IDL.Opt(IDL.Nat)], [IDL.Vec(UpperResult_4)], []),
    getQuoteLedger: IDL.Func([], [IDL.Principal], ["query"]),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
    icrc84_deposit: IDL.Func(
      [
        IDL.Record({
          token: IDL.Principal,
          from: IDL.Record({
            owner: IDL.Principal,
            subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
          amount: IDL.Nat,
          expected_fee: IDL.Opt(IDL.Nat),
        }),
      ],
      [DepositResult],
      [],
    ),
    icrc84_notify: IDL.Func([IDL.Record({ token: IDL.Principal })], [NotifyResult], []),
    icrc84_query: IDL.Func(
      [IDL.Vec(IDL.Principal)],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Principal,
            IDL.Record({
              credit: IDL.Int,
              tracked_deposit: IDL.Opt(IDL.Nat),
            }),
          ),
        ),
      ],
      ["query"],
    ),
    icrc84_supported_tokens: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    icrc84_token_info: IDL.Func([IDL.Principal], [TokenInfo], ["query"]),
    icrc84_withdraw: IDL.Func(
      [
        IDL.Record({
          to: IDL.Record({
            owner: IDL.Principal,
            subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
          token: IDL.Principal,
          amount: IDL.Nat,
          expected_fee: IDL.Opt(IDL.Nat),
        }),
      ],
      [WithdrawResult],
      [],
    ),
    indicativeStats: IDL.Func([IDL.Principal], [IndicativeStats], ["query"]),
    isTokenHandlerFrozen: IDL.Func([IDL.Principal], [IDL.Bool], ["query"]),
    listAdmins: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    manageOrders: IDL.Func(
      [
        IDL.Opt(
          IDL.Variant({
            all: IDL.Opt(IDL.Vec(IDL.Principal)),
            orders: IDL.Vec(IDL.Variant({ ask: OrderId, bid: OrderId })),
          }),
        ),
        IDL.Vec(
          IDL.Variant({
            ask: IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64),
            bid: IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64),
          }),
        ),
        IDL.Opt(IDL.Nat),
      ],
      [UpperResult_3],
      [],
    ),
    nextSession: IDL.Func([], [IDL.Record({ counter: IDL.Nat, timestamp: IDL.Nat })], ["query"]),
    placeAsks: IDL.Func(
      [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64)), IDL.Opt(IDL.Nat)],
      [IDL.Vec(UpperResult_2)],
      [],
    ),
    placeBids: IDL.Func(
      [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64)), IDL.Opt(IDL.Nat)],
      [IDL.Vec(UpperResult_2)],
      [],
    ),
    principalToSubaccount: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Vec(IDL.Nat8))], ["query"]),
    queryAsks: IDL.Func([], [IDL.Vec(IDL.Tuple(OrderId, Order, IDL.Nat))], ["query"]),
    queryBids: IDL.Func([], [IDL.Vec(IDL.Tuple(OrderId, Order, IDL.Nat))], ["query"]),
    queryCredit: IDL.Func([IDL.Principal], [CreditInfo, IDL.Nat], ["query"]),
    queryCredits: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, CreditInfo, IDL.Nat))], ["query"]),
    queryDepositHistory: IDL.Func([IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat], [IDL.Vec(DepositHistoryItem)], ["query"]),
    queryOrderBook: IDL.Func(
      [IDL.Principal],
      [
        IDL.Record({
          asks: IDL.Vec(IDL.Tuple(OrderId, UserOrder)),
          bids: IDL.Vec(IDL.Tuple(OrderId, UserOrder)),
        }),
      ],
      ["query"],
    ),
    queryPoints: IDL.Func([], [IDL.Nat], ["query"]),
    queryPriceHistory: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat, IDL.Bool],
      [IDL.Vec(PriceHistoryItem)],
      ["query"],
    ),
    queryTokenAsks: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(OrderId, Order)), IDL.Nat], ["query"]),
    queryTokenBids: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(OrderId, Order)), IDL.Nat], ["query"]),
    queryTokenHandlerDepositRegistry: IDL.Func(
      [IDL.Principal],
      [IDL.Nat, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Record({ value: IDL.Nat, lock: IDL.Bool })))],
      ["query"],
    ),
    queryTokenHandlerJournal: IDL.Func(
      [IDL.Principal, IDL.Nat, IDL.Nat],
      [IDL.Vec(IDL.Tuple(IDL.Principal, LogEvent))],
      ["query"],
    ),
    queryTokenHandlerNotificationLock: IDL.Func(
      [IDL.Principal, IDL.Principal],
      [IDL.Opt(IDL.Record({ value: IDL.Nat, lock: IDL.Bool }))],
      ["query"],
    ),
    queryTokenHandlerNotificationsOnPause: IDL.Func([IDL.Principal], [IDL.Bool], ["query"]),
    queryTokenHandlerState: IDL.Func(
      [IDL.Principal],
      [
        IDL.Record({
          balance: IDL.Record({
            deposited: IDL.Nat,
            underway: IDL.Nat,
            queued: IDL.Nat,
            consolidated: IDL.Nat,
          }),
          flow: IDL.Record({
            withdrawn: IDL.Nat,
            consolidated: IDL.Nat,
          }),
          credit: IDL.Record({ total: IDL.Int, pool: IDL.Int }),
          ledger: IDL.Record({ fee: IDL.Nat }),
          users: IDL.Record({ queued: IDL.Nat }),
        }),
      ],
      ["query"],
    ),
    queryTransactionHistory: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(TransactionHistoryItem)],
      ["query"],
    ),
    queryTransactionHistoryForward: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(TransactionHistoryItem), IDL.Nat, IDL.Bool],
      ["query"],
    ),
    queryUserAsks: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(OrderId, Order))], ["query"]),
    queryUserBids: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(OrderId, Order))], ["query"]),
    queryUserCredits: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(IDL.Principal, CreditInfo))], ["query"]),
    queryUserCreditsInTokenHandler: IDL.Func([IDL.Principal, IDL.Principal], [IDL.Int], ["query"]),
    queryUserDepositHistory: IDL.Func(
      [IDL.Principal, IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(DepositHistoryItem)],
      ["query"],
    ),
    queryUserTransactionHistory: IDL.Func(
      [IDL.Principal, IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(TransactionHistoryItem)],
      ["query"],
    ),
    registerAsset: IDL.Func([IDL.Principal, IDL.Nat], [UpperResult_1], []),
    removeAdmin: IDL.Func([IDL.Principal], [], []),
    replaceAsk: IDL.Func([OrderId, IDL.Nat, IDL.Float64, IDL.Opt(IDL.Nat)], [UpperResult], []),
    replaceBid: IDL.Func([OrderId, IDL.Nat, IDL.Float64, IDL.Opt(IDL.Nat)], [UpperResult], []),
    setConsolidationTimerEnabled: IDL.Func([IDL.Bool], [], []),
    settings: IDL.Func(
      [],
      [
        IDL.Record({
          orderQuoteVolumeMinimum: IDL.Nat,
          orderPriceDigitsLimit: IDL.Nat,
          orderQuoteVolumeStep: IDL.Nat,
        }),
      ],
      ["query"],
    ),
    totalPointsSupply: IDL.Func([], [IDL.Nat], ["query"]),
    updateTokenHandlerFee: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], []),
    wipeOrders: IDL.Func([], [], []),
    wipePriceHistory: IDL.Func([IDL.Principal], [], []),
    wipeUsers: IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => {
  return [];
};
