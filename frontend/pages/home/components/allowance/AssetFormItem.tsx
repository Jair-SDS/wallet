import { Allowance, ErrorFields } from "@/@types/allowance";
import { ValidationErrors } from "@/@types/common";
import { SelectOption } from "@/@types/core";
import { IconTypeEnum } from "@/const";
import { getAssetIcon } from "@/utils/icons";
import { Select } from "@components/select";
import { initialAllowanceState } from "@pages/home/hooks/useCreateAllowance";
import { Asset } from "@redux/models/AccountModels";
import { useMemo, useState } from "react";

interface AssetFormItemProps {
  allowance: Allowance;
  assets: Asset[];
  selectedAsset: Asset | undefined;
  setAllowanceState: (allowanceData: Partial<Allowance>) => void;
  isLoading?: boolean;
  errors?: ValidationErrors[];
}

export default function AssetFormItem(props: AssetFormItemProps) {
  const [search, setSearch] = useState<string | null>(null);
  const { allowance, assets, selectedAsset, setAllowanceState, isLoading, errors } = props;
  const { asset } = allowance;

  const error = errors?.filter((error) => error.field === ErrorFields.asset)[0];

  function formatAsset(asset: Asset) {
    return {
      value: asset?.tokenName,
      label: `${asset?.tokenName} / ${asset?.tokenSymbol}`,
      icon: getAssetIcon(IconTypeEnum.Enum.ASSET, asset?.tokenSymbol, asset?.logo),
    };
  }

  const options = useMemo(() => {
    if (!search) return assets.map(formatAsset);
    const searchLower = search.toLowerCase();

    return assets
      .filter((asset) => {
        return (
          asset.tokenName.toLowerCase().includes(searchLower) || asset.tokenSymbol.toLowerCase().includes(searchLower)
        );
      })
      .map(formatAsset);
  }, [search, assets]);

  const onAssetChange = (option: SelectOption) => {
    setSearch(null);
    const fullAsset = assets.find((asset) => asset.tokenName === option.value);
    setAllowanceState({ asset: fullAsset, subAccount: initialAllowanceState.subAccount });
  };

  const onSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const onOpenChange = () => setSearch(null);

  return (
    <div className="mt-4">
      <label htmlFor="asset" className="text-lg">
        Asset
      </label>
      <Select
        onSelect={onAssetChange}
        options={options}
        initialValue={selectedAsset?.tokenName}
        currentValue={asset?.tokenName}
        disabled={isLoading}
        border={error ? "error" : undefined}
        onSearch={onSearchChange}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}
