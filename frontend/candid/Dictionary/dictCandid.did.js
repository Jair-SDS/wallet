export const idlFactory = ({ IDL }) => {
  const Symbol = IDL.Text;
  const AssetId = IDL.Nat;
  const Time = IDL.Int;
  const Logo = IDL.Text;
  const Name = IDL.Text;
  const FungibleToken = IDL.Record({
    "creation_time" : Time,
    "assetId" : AssetId,
    "logo" : Logo,
    "name" : Name,
    "modification_time" : Time,
    "displaySymbol" : Symbol,
    "symbolKey" : Symbol,
  });
  const Directory = IDL.Service({
    "addOwner" : IDL.Func([IDL.Principal], [IDL.Bool], []),
    "correctAssetId" : IDL.Func([Symbol, AssetId], [IDL.Bool], []),
    "correctSymbol" : IDL.Func([AssetId, Symbol], [IDL.Bool], []),
    "getByAssetId" : IDL.Func([AssetId], [IDL.Opt(FungibleToken)], ["query"]),
    "getBySymbol" : IDL.Func([Symbol], [IDL.Opt(FungibleToken)], ["query"]),
    "getDump" : IDL.Func([], [IDL.Vec(FungibleToken)], ["query"]),
    "register" : IDL.Func([FungibleToken], [IDL.Bool], []),
    "removeOwner" : IDL.Func([IDL.Principal], [IDL.Bool], []),
    "updateTokenByAssetId" : IDL.Func(
        [AssetId, IDL.Text, IDL.Text],
        [IDL.Bool],
        [],
      ),
    "updateTokenBySymbol" : IDL.Func(
        [Symbol, IDL.Text, IDL.Text],
        [IDL.Bool],
        [],
      ),
  });
  return Directory;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };