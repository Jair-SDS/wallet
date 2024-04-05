import { AllowanceValidationErrorsEnum, TAllowance } from "@/@types/allowance";
import { submitAllowanceApproval, createApproveAllowanceParams, getSubAccountBalance } from "@/pages/home/helpers/icrc";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import useAllowanceDrawer from "./useAllowanceDrawer";
import { validateUpdateAllowance } from "../helpers/allowanceValidators";
import { updateSubAccountBalance } from "@redux/assets/AssetReducer";
import {
  removeAllowanceErrorAction,
  setAllowanceErrorAction,
  setFullAllowanceErrorsAction,
  setIsLoadingAllowanceAction,
} from "@redux/allowance/AllowanceActions";
import { Asset } from "@redux/models/AccountModels";
import dayjs from "dayjs";
import { refreshAllowance } from "../helpers/refreshAllowance";
// eslint-disable-next-line import/named
import { throttle } from "lodash";

export function useUpdateAllowance() {
  const dispatch = useAppDispatch();
  const { onCloseUpdateAllowanceDrawer } = useAllowanceDrawer();
  const { selectedAllowance, allowances } = useAppSelector((state) => state.allowance);
  const { assets } = useAppSelector((state) => state.asset);
  const [allowance, setAllowance] = useState<TAllowance>(selectedAllowance);

  const setAllowanceState = (allowanceData: Partial<TAllowance>) => {
    setAllowance({
      ...allowance,
      ...allowanceData,
    });
  };

  const mutationFn = useCallback(async () => {
    setIsLoadingAllowanceAction(true);
    setFullAllowanceErrorsAction([]);
    const asset = assets.find((asset) => asset.tokenSymbol === allowance.asset.tokenSymbol) as Asset;
    const existingAllowance = allowances.find(
      (currentAllowance) =>
        currentAllowance.spender === allowance.spender &&
        currentAllowance.subAccountId === allowance.subAccountId &&
        currentAllowance.asset.tokenSymbol === allowance.asset.tokenSymbol,
    );

    if (existingAllowance) {
      if (
        !dayjs(allowance.expiration).isSame(dayjs(existingAllowance.expiration)) ||
        allowance.amount !== existingAllowance.amount
      ) {
        validateUpdateAllowance(allowance, asset);
        const params = createApproveAllowanceParams(allowance);
        await submitAllowanceApproval(params, allowance.asset.address);
        await refreshAllowance(allowance);
      }
    }
  }, [allowance]);

  const onSuccess = async () => {
    setIsLoadingAllowanceAction(false);
    const refreshParams = {
      subAccount: allowance.subAccountId,
      assetAddress: allowance.asset.address,
    };
    const amount = await getSubAccountBalance(refreshParams);
    const balance = amount ? amount.toString() : "0";
    dispatch(updateSubAccountBalance(allowance.asset.tokenSymbol, allowance.subAccountId, balance));
    onCloseUpdateAllowanceDrawer();
  };

  const onError = (error: string) => {
    setIsLoadingAllowanceAction(false);
    if (error === AllowanceValidationErrorsEnum.Values["error.invalid.amount"])
      return setAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.invalid.amount"]);
    removeAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.invalid.amount"]);

    if (error === AllowanceValidationErrorsEnum.Values["error.not.enough.balance"])
      return setAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.not.enough.balance"]);
    removeAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.not.enough.balance"]);

    if (error === AllowanceValidationErrorsEnum.Values["error.before.present.expiration"])
      return setAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.before.present.expiration"]);
    removeAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.before.present.expiration"]);
  };

  const { mutate, isPending, isError, error, isSuccess } = useMutation({ mutationFn, onError, onSuccess });

  return {
    isPending,
    isError,
    error,
    isSuccess,
    allowance,
    updateAllowance: throttle(mutate, 1000),
    setAllowanceState,
  };
}
