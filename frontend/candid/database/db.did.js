export const idlFactory = ({ IDL }) => {
  const AssetDocument = IDL.Record({
    deleted: IDL.Bool,
    logo: IDL.Text,
    name: IDL.Text,
    tokenSymbol: IDL.Text,
    updatedAt: IDL.Nat32,
    supportedStandards: IDL.Vec(IDL.Text),
    address: IDL.Text,
    tokenName: IDL.Text,
    index: IDL.Text,
    sortIndex: IDL.Nat32,
    shortDecimal: IDL.Text,
    decimal: IDL.Text,
    subAccounts: IDL.Vec(
      IDL.Record({
        transaction_fee: IDL.Text,
        currency_amount: IDL.Text,
        name: IDL.Text,
        sub_account_id: IDL.Text,
        address: IDL.Text,
        amount: IDL.Text,
        decimal: IDL.Nat32,
        symbol: IDL.Text,
      }),
    ),
    symbol: IDL.Text,
  });
  const ContactDocument = IDL.Record({
    principal: IDL.Text,
    deleted: IDL.Bool,
    name: IDL.Text,
    assets: IDL.Vec(
      IDL.Record({
        subaccounts: IDL.Vec(
          IDL.Record({
            name: IDL.Text,
            sub_account_id: IDL.Text,
            subaccount_index: IDL.Text,
          }),
        ),
        logo: IDL.Text,
        tokenSymbol: IDL.Text,
        supportedStandards: IDL.Vec(IDL.Text),
        address: IDL.Text,
        shortDecimal: IDL.Text,
        decimal: IDL.Text,
        symbol: IDL.Text,
      }),
    ),
    updatedAt: IDL.Nat32,
    accountIdentier: IDL.Text,
  });
  const AllowanceDocument = IDL.Record({
    id: IDL.Text,
    deleted: IDL.Bool,
    asset: IDL.Record({
      logo: IDL.Text,
      name: IDL.Text,
      tokenSymbol: IDL.Text,
      supportedStandards: IDL.Vec(IDL.Text),
      address: IDL.Text,
      tokenName: IDL.Text,
      decimal: IDL.Text,
      symbol: IDL.Text,
    }),
    updatedAt: IDL.Nat32,
    subAccountId: IDL.Text,
    spender: IDL.Text,
  });
  const HplSubAccountDocument = IDL.Record({
    deleted: IDL.Bool,
    id: IDL.Text,
    ftId: IDL.Text,
    name: IDL.Text,
    ledger: IDL.Text,
    updatedAt: IDL.Nat32,
  });
  const HplVirtualDocument = IDL.Record({
    deleted: IDL.Bool,
    id: IDL.Text,
    ftId: IDL.Text,
    name: IDL.Text,
    isMint: IDL.Bool,
    updatedAt: IDL.Nat32,
    accesBy: IDL.Text,
    ledger: IDL.Text,
  });
  const HplAssetDocument = IDL.Record({
    deleted: IDL.Bool,
    id: IDL.Text,
    controller: IDL.Text,
    decimals: IDL.Text,
    name: IDL.Text,
    description: IDL.Text,
    updatedAt: IDL.Nat32,
    symbol: IDL.Text,
    ledger: IDL.Text,
  });
  const HplCountDocument = IDL.Record({
    deleted: IDL.Bool,
    nAccounts: IDL.Text,
    principal: IDL.Text,
    nVirtualAccounts: IDL.Text,
    updatedAt: IDL.Nat32,
    nFtAssets: IDL.Text,
    ledger: IDL.Text,
  });
  const HplContactDocument = IDL.Record({
    deleted: IDL.Bool,
    principal: IDL.Text,
    name: IDL.Text,
    updatedAt: IDL.Nat32,
    remotes: IDL.Vec(
      IDL.Record({
        status: IDL.Text,
        expired: IDL.Text,
        code: IDL.Text,
        ftIndex: IDL.Text,
        name: IDL.Text,
        index: IDL.Text,
        amount: IDL.Text,
      }),
    ),
    ledger: IDL.Text,
  });
  const WalletDatabase = IDL.Service({
    doesStorageExist: IDL.Func([], [IDL.Bool], ["query"]),
    dump: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Principal,
            IDL.Tuple(
              IDL.Vec(IDL.Opt(AssetDocument)),
              IDL.Vec(IDL.Opt(ContactDocument)),
              IDL.Vec(IDL.Opt(AllowanceDocument)),
              IDL.Vec(IDL.Opt(HplSubAccountDocument)),
              IDL.Vec(IDL.Opt(HplVirtualDocument)),
              IDL.Vec(IDL.Opt(HplAssetDocument)),
              IDL.Vec(IDL.Opt(HplCountDocument)),
              IDL.Vec(IDL.Opt(HplContactDocument)),
            ),
          ),
        ),
      ],
      ["query"],
    ),
    pullAllowances: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(AllowanceDocument)], ["query"]),
    pullAssets: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(AssetDocument)], ["query"]),
    pullContacts: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(ContactDocument)], ["query"]),
    pullHplAssets: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(HplAssetDocument)], ["query"]),
    pullHplContacts: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(HplContactDocument)], ["query"]),
    pullHplCount: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(HplCountDocument)], ["query"]),
    pullHplSubaccounts: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(HplSubAccountDocument)], ["query"]),
    pullHplVirtuals: IDL.Func([IDL.Nat32, IDL.Opt(IDL.Text), IDL.Nat], [IDL.Vec(HplVirtualDocument)], ["query"]),
    pushAllowances: IDL.Func([IDL.Vec(AllowanceDocument)], [IDL.Vec(AllowanceDocument)], []),
    pushAssets: IDL.Func([IDL.Vec(AssetDocument)], [IDL.Vec(AssetDocument)], []),
    pushContacts: IDL.Func([IDL.Vec(ContactDocument)], [IDL.Vec(ContactDocument)], []),
    pushHplAssets: IDL.Func([IDL.Vec(HplAssetDocument)], [IDL.Vec(HplAssetDocument)], []),
    pushHplContacts: IDL.Func([IDL.Vec(HplContactDocument)], [IDL.Vec(HplContactDocument)], []),
    pushHplCount: IDL.Func([IDL.Vec(HplCountDocument)], [IDL.Vec(HplCountDocument)], []),
    pushHplSubaccounts: IDL.Func([IDL.Vec(HplSubAccountDocument)], [IDL.Vec(HplSubAccountDocument)], []),
    pushHplVirtuals: IDL.Func([IDL.Vec(HplVirtualDocument)], [IDL.Vec(HplVirtualDocument)], []),
  });
  return WalletDatabase;
};
export const init = ({ IDL }) => {
  return [];
};
