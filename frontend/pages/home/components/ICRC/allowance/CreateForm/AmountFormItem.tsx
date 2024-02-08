import { TAllowance, AllowanceErrorFieldsEnum } from "@/@types/allowance";
import { TErrorValidation } from "@/@types/common";
import { IconTypeEnum } from "@/const";
import { getAssetIcon } from "@/utils/icons";
import { CurrencyInput } from "@components/input";
import { Asset } from "@redux/models/AccountModels";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface IAmountFormItemProps {
  allowance: TAllowance;
  selectedAsset?: Asset | undefined;
  setAllowanceState: (allowanceData: Partial<TAllowance>) => void;
  isLoading?: boolean;
  errors?: TErrorValidation[];
}

export default function AmountFormItem(props: IAmountFormItemProps) {
  const { t } = useTranslation();
  const { allowance, setAllowanceState, isLoading, errors } = props;
  const error = errors?.filter((error) => error.field === AllowanceErrorFieldsEnum.Values.amount)[0];
  const { asset } = allowance;

  const { icon, symbol } = useMemo(() => {
    const symbol = asset?.tokenSymbol;
    const logo = asset?.logo;
    return {
      icon: getAssetIcon(IconTypeEnum.Enum.ASSET, symbol, logo),
      symbol,
    };
  }, [allowance]);

  const onAmountChange = (value: string) => {
    const amount = value;
    setAllowanceState({ amount });
  };

  return (
    <div className="mt-4">
      <label htmlFor="Amount" className="text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor">
        {t("amount")}
      </label>
      <CurrencyInput
        onCurrencyChange={onAmountChange}
        currency={symbol}
        icon={icon}
        className="mt-2"
        isLoading={isLoading}
        border={error ? "error" : undefined}
      />
    </div>
  );
}
