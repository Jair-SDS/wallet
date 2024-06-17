import { ReactComponent as DownAmountIcon } from "@assets/svg/files/down-blue-arrow.svg";
//
import Receiver from "./Receiver";
import Sender from "./Sender";
import TransferAssetSelector from "./TransferAssetSelector";
import { useTranslation } from "react-i18next";
import { LoadingLoader } from "@components/loader";
import { BasicButton } from "@components/button";
import { useState } from "react";
import { isAmountGreaterThanFee, isPrincipalValid, isSubAccountIdValid } from "@pages/home/helpers/validators";
import { TransferFromTypeEnum, TransferToTypeEnum, useTransfer } from "@pages/home/contexts/TransferProvider";
import { useAppSelector } from "@redux/Store";
import logger from "@/common/utils/logger";
import { setTransactionDrawerAction } from "@redux/transaction/TransactionActions";
import { TransactionDrawer } from "@/@types/transactions";
import { TransferView, useTransferView } from "@pages/home/contexts/TransferViewProvider";
import ICRC2Allowance from "@common/libs/icrcledger/ICRC2Allowance";
import { hexToUint8Array } from "@common/utils/hexadecimal";
import { Principal } from "@dfinity/principal";

export default function TransferForm() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { transferState, setTransferState } = useTransfer();
  const { setView } = useTransferView();
  const assets = useAppSelector((state) => state.asset.list.assets);
  const services = useAppSelector((state) => state.services.services);
  const { userPrincipal, userAgent } = useAppSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const currentAsset = assets.find((asset) => asset.tokenSymbol === transferState.tokenSymbol);

  return (
    <div className="px-[1rem] pt-[1rem] space-y-[1rem]">
      <TransferAssetSelector />
      <Sender />
      <DownAmountIcon className="w-full mt-4" />
      <Receiver />

      <div className="flex items-center justify-end mt-6">
        <p className="mr-4 text-sm text-slate-color-error">{errorMessage}</p>
        {isLoading && <LoadingLoader className="mr-4" />}
        <BasicButton className="min-w-[5rem] mr-2 font-bold bg-secondary-color-2 text-md" onClick={onCancel}>
          {t("cancel")}
        </BasicButton>
        <BasicButton className="min-w-[5rem] font-bold bg-primary-color text-md" onClick={onNext}>
          {t("next")}
        </BasicButton>
      </div>
    </div>
  );

  async function onNext() {
    try {
      setIsLoading(false);
      setErrorMessage("");

      const isAllowanceContact = transferState.fromType === TransferFromTypeEnum.allowanceContactBook;
      const isAllowanceManual = transferState.fromType === TransferFromTypeEnum.allowanceManual;

      commonValidations();
      if (transferState.fromType === TransferFromTypeEnum.own) fromOwnSubaccountValidations();
      if (isAllowanceContact || isAllowanceManual) await fromAllowanceValidations();
      if (transferState.fromType === TransferFromTypeEnum.service) fromServiceValidations();

      setView(TransferView.CONFIRM_DETAIL);
    } catch (error) {
      logger.debug(error);
    } finally {
      setIsLoading(false);
    }
  }

  function onCancel() {
    setTransferState({
      tokenSymbol: "",
      fromType: TransferFromTypeEnum.own,
      fromPrincipal: "",
      fromSubAccount: "",
      toType: TransferToTypeEnum.thirdPartyICRC,
      toPrincipal: "",
      toSubAccount: "",
      amount: "",
      duration: "",
    });
    setTransactionDrawerAction(TransactionDrawer.NONE);
  }

  function commonValidations() {
    if (!transferState.tokenSymbol) {
      setErrorMessage("Asset must be selected");
      throw new Error("Token symbol must be selected");
    }

    if (!isPrincipalValid(transferState.fromPrincipal)) {
      setErrorMessage("Invalid FROM details");
      throw new Error("isPrincipalValid: from principal must be valid and no empty");
    }

    if (!isPrincipalValid(transferState.toPrincipal)) {
      setErrorMessage("Invalid TO details");
      throw new Error("isPrincipalValid: to principal must be valid and no empty");
    }

    if (!isSubAccountIdValid(transferState.fromSubAccount)) {
      setErrorMessage("Invalid FROM details");
      throw new Error("isSubAccountIdValid: from sub account must be valid and no empty");
    }

    if (!isSubAccountIdValid(transferState.toSubAccount)) {
      setErrorMessage("Invalid TO details");
      throw new Error("isSubAccountIdValid: to sub account must be valid and no empty");
    }
  }

  function fromOwnSubaccountValidations() {
    if (!currentAsset) {
      setErrorMessage("Invalid asset selected");
      throw new Error("TransferForm: asset not found");
    }

    const subaccount = currentAsset.subAccounts.find(
      (subAccount) => subAccount.sub_account_id === transferState.fromSubAccount,
    );

    if (Number(subaccount?.amount || "0") === 0) {
      setErrorMessage("FROM subaccount has not balance");
      throw new Error("fromOwnSubaccountValidations: from sub account must have balance");
    }

    if (!isAmountGreaterThanFee(currentAsset, transferState.fromSubAccount)) {
      setErrorMessage("FROM subaccount does not cover the fee");
      throw new Error("isAmountGreaterThanFee: subaccount amount must be greater than fee");
    }

    // --------------- OWN TO OWN SUB ACCOUNT ---------------
    if (transferState.toType === TransferToTypeEnum.own) {
      if (transferState.fromSubAccount === transferState.toSubAccount) {
        setErrorMessage("FROM and TO subaccounts must be different");
        throw new Error("fromOwnSubaccountValidations: sub accounts must be differents");
      }

      if (transferState.fromPrincipal !== transferState.toPrincipal) {
        setErrorMessage("From and To principals must be the same");
        throw new Error("fromOwnSubaccountValidations: principals must be same");
      }

      if (transferState.fromPrincipal !== userPrincipal.toString()) {
        setErrorMessage("From principal must be the session principal");
        throw new Error("fromOwnSubaccountValidations: from principal must be the session principal");
      }
    }

    // --------------- OWN TO MANUAL / ICRC / SCANNER ---------------
    const isToManual = transferState.toType === TransferToTypeEnum.manual;
    const isToIcrc = transferState.toType === TransferToTypeEnum.thirdPartyICRC;
    const isToScanner = transferState.toType === TransferToTypeEnum.thidPartyScanner;

    if (isToManual || isToIcrc || isToScanner) {
      if (transferState.toPrincipal === userPrincipal.toString()) {
        if (transferState.fromSubAccount === transferState.toSubAccount) {
          setErrorMessage("FROM and TO subaccounts must be different");
          throw new Error("fromOwnSubaccountValidations: sub accounts must be differents");
        }
      }
    }
  }

  async function fromAllowanceValidations() {
    if (!currentAsset) {
      setErrorMessage("Invalid asset selected");
      throw new Error("TransferForm: asset not found");
    }

    // case 1: from principal must be different to the session principal
    if (transferState.fromPrincipal === userPrincipal.toString()) {
      setErrorMessage("Self allowance not allowed");
      throw new Error("fromAllowanceValidations: from principal must be different to session principal");
    }

    // case 2: allowance not exist or expired
    const allowance = await ICRC2Allowance({
      agent: userAgent,
      canisterId: Principal.fromText(currentAsset.address),
      account: {
        owner: Principal.fromText(transferState.fromPrincipal),
        subaccount: [new Uint8Array(hexToUint8Array(transferState.fromSubAccount))],
      },
      spender: {
        owner: userPrincipal,
        subaccount: [],
      },
    });

    if (allowance.allowance === BigInt(0)) {
      setErrorMessage("Allowance does not exist or expired");
      throw new Error("fromAllowanceValidations: allowance does not exist or expired");
    }

    // case 3: allowance balance must be greater than the transaction fee
    const fee = BigInt(currentAsset.subAccounts[0].transaction_fee);

    if (fee > allowance.allowance) {
      setErrorMessage("Allowance does not cover the fee");
      throw new Error("isAllowanceGreaterThanFree: allowance amount must be greater than fee");
    }

    // -------------- ALLOWANCE TO MANUAL / ICRC / SCANNER / CONTACT ---------------
    const isToManual = transferState.toType === TransferToTypeEnum.manual;
    const isToIcrc = transferState.toType === TransferToTypeEnum.thirdPartyICRC;
    const isToScanner = transferState.toType === TransferToTypeEnum.thidPartyScanner;
    const isToContact = transferState.toType === TransferToTypeEnum.thirdPartyContact;

    if (isToManual || isToIcrc || isToScanner || isToContact) {
      // case 2: from principal is different the session principal, but both are same. Sub account must be different
      if (transferState.fromPrincipal === transferState.toPrincipal) {
        if (transferState.fromSubAccount === transferState.toSubAccount) {
          setErrorMessage("FROM subaccount and TO subaccount must be different");
          throw new Error("fromAllowanceValidations: sub accounts must be differents");
        }
      }
    }
  }

  function fromServiceValidations() {
    if (!currentAsset) {
      setErrorMessage("Invalid asset selected");
      throw new Error("TransferForm: asset not found");
    }

    const currentService = services.find((service) => service.principal === transferState.fromPrincipal);

    if (!currentService) {
      setErrorMessage("Invalid service selected");
      throw new Error("TransferForm: service not found");
    }

    const serviceAccount = currentService.assets.find((asset) => asset.tokenSymbol === transferState.tokenSymbol);

    if (!serviceAccount) {
      setErrorMessage("Invalid asset selected");
      throw new Error("TransferForm: asset not found");
    }

    const balance = BigInt(serviceAccount.balance);
    // case 1: service account balance must have balance
    if (balance === BigInt(0)) {
      setErrorMessage("Service account has not balance");
      throw new Error("fromServiceValidations: service account must have balance");
    }

    // case 2: service account balance must be greater than the transaction fee
    const fee = BigInt(currentAsset.subAccounts[0].transaction_fee);
    if (balance < fee) {
      setErrorMessage("Service account does not cover the fee");
      throw new Error("fromServiceValidations: service account balance must be greater than fee");
    }

    // case 3: service min withrawal
    const minWithdrawal = BigInt(serviceAccount.minWithdraw);
    if (balance < minWithdrawal) {
      setErrorMessage("Service account balance is less than the min withdrawal");
      throw new Error("fromServiceValidations: service account balance must be greater than min withdrawal");
    }

    // case 4: min withdrawal + fee must be less or equal to balance
    if (balance < minWithdrawal + fee) {
      setErrorMessage("Service account balance is less than the min withdrawal plus fee");
      throw new Error("fromServiceValidations: service account balance must be greater than min withdrawal plus fee");
    }
  }
}
