export const idlFactory = ({ IDL }) => {
  const CreateArgument = IDL.Record({
    "assetId" : IDL.Nat,
    "logo" : IDL.Text,
    "name" : IDL.Text,
    "symbol" : IDL.Text,
  });
  const FungibleToken = IDL.Record({
    "assetId" : IDL.Nat,
    "modifiedAt" : IDL.Int,
    "logo" : IDL.Text,
    "name" : IDL.Text,
    "createdAt" : IDL.Int,
    "symbol" : IDL.Text,
  });
  const UpdateArgument = IDL.Record({
    "logo" : IDL.Opt(IDL.Text),
    "name" : IDL.Opt(IDL.Text),
    "symbol" : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    "addOwner" : IDL.Func([IDL.Principal], [], []),
    "addToken" : IDL.Func([CreateArgument], [], []),
    "allTokens" : IDL.Func([], [IDL.Vec(FungibleToken)], ["query"]),
    "correctAssetId" : IDL.Func([IDL.Text, IDL.Nat], [], []),
    "correctSymbol" : IDL.Func([IDL.Nat, IDL.Text], [], []),
    "freezingPeriod" : IDL.Func([], [IDL.Nat], ["query"]),
    "nTokens" : IDL.Func([], [IDL.Nat], ["query"]),
    "owners" : IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    "removeOwner" : IDL.Func([IDL.Principal], [], []),
    "tokenByAssetId" : IDL.Func([IDL.Nat], [IDL.Opt(FungibleToken)], ["query"]),
    "tokenBySymbol" : IDL.Func([IDL.Text], [IDL.Opt(FungibleToken)], ["query"]),
    "updateToken" : IDL.Func([IDL.Nat, UpdateArgument], [], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Opt(IDL.Principal)]; };