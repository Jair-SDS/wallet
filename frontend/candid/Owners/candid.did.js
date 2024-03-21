export const idlFactory = ({ IDL }) => {
  const LedgerIngressAPI = IDL.Service({
    lookup: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], ["query"]),
    get: IDL.Func([IDL.Nat], [IDL.Principal], ["query"]),
  });
  return LedgerIngressAPI;
};
export const init = ({ IDL }) => {
  return [];
};
