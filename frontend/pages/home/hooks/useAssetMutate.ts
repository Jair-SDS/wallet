import { defaultSubAccount } from "@/defaultTokens";
import { Asset } from "@redux/models/AccountModels";
import { useState } from "react";

export const assetMutateInitialState: Asset = {
  address: "",
  symbol: "",
  name: "",
  tokenSymbol: "",
  tokenName: "",
  decimal: "",
  shortDecimal: "",
  subAccounts: [defaultSubAccount],
  index: "",
  sortIndex: 999,
  supportedStandards: [],
};

export default function useAssetMutate() {
  const [newAsset, setNewAsset] = useState<Asset>(assetMutateInitialState);
  const [errToken, setErrToken] = useState("");

  // useEffect(() => {
  //   TODO: set to redux status adding asset
  //   if (!isAppDataFreshing) setAddStatus(AddingAssetsEnum.Enum.done);
  // }, [isAppDataFreshing]);

  return {
    newAsset,
    setNewAsset,
    setErrToken,
    errToken,
  };
}
