import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

// --------------- TYPES ---------------

type TransferProviderProps = {
  children: JSX.Element;
};

// sender: own, allowance (contact book, inputs, scanner) and services
export enum TransferFromTypeEnum {
  own = "OWN",
  allowance = "ALLOWANCE",
  service = "SERVICE",
}

// receiver: manual (no need select), own (their own select), third icrc or scanner (need inputs) and thid contact book or services (need select)
export enum TransferToTypeEnum {
  own = "OWN",
  thirdPartyICRC = "THIRD_PARTY_ICRC",
  thidPartyScanner = "THIRD_PARTY_SCANNER",
  thirdPartyContact = "THIRD_PARTY_CONTACT",
  thirdPartyService = "THIRD_PARTY_SERVICE",
  manual = "MANUAL",
}

export type TransferStateType = {
  tokenSymbol: string;

  fromType: TransferFromTypeEnum;
  fromPrincipal: string;
  fromSubAccount: string;

  toType: TransferToTypeEnum;
  toPrincipal: string;
  toSubAccount: string;
};

export type TransferProviderType = {
  transferState: TransferStateType;
  setTransferState: Dispatch<SetStateAction<TransferStateType>>;
};

// --------------- CONTEXT ---------------

export const TransferContext = createContext<TransferProviderType | null>(null);

export default function TransferProvider({ children }: TransferProviderProps) {

  const [transferState, setTransferState] = useState<TransferStateType>({
    tokenSymbol: "",
    // Helpful to determine which validation must be applied
    fromType: TransferFromTypeEnum.own,
    fromPrincipal: "",
    fromSubAccount: "",
    // Helpful to determine which validation must be applied
    toType: TransferToTypeEnum.thirdPartyICRC,
    toPrincipal: "",
    toSubAccount: "",
  });

  console.log("transferState: ", transferState);
  const value = { transferState, setTransferState };
  return <TransferContext.Provider value={{ ...value }}>{children}</TransferContext.Provider>;
}

// --------------- HOOK ---------------

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error("useTransfer must be used within a TransferProvider");
  }

  return context;
};
