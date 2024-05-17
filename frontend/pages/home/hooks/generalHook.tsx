import { useAppSelector } from "@redux/Store";

export const GeneralHook = () => {
  const { assets } = useAppSelector((state) => state.asset.list);
  const { selectedAsset, selectedAccount } = useAppSelector((state) => state.asset.helper);
  const { selectedTransaction } = useAppSelector((state) => state.transaction);
  const { ICPSubaccounts, accounts } = useAppSelector((state) => state.asset);
  const { hplFTs, subaccounts } = useAppSelector((state) => state.hpl);
  const { protocol } = useAppSelector((state) => state.common);
  const { userAgent, userPrincipal } = useAppSelector((state) => state.auth);

  return {
    userAgent,
    protocol,
    assets,
    userPrincipal,
    hplFTs,
    ICPSubaccounts,
    accounts,
    selectedTransaction,
    // HPL
    subaccounts,
    selectedAsset,
    selectedAccount,
  };
};
