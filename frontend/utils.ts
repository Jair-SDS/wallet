import { Principal } from "@dfinity/principal";
import { getCrc32 } from "@dfinity/principal/lib/cjs/utils/getCrc";
import { sha224 } from "@dfinity/principal/lib/cjs/utils/sha224.js";
import { Buffer } from "buffer";
import bigInt from "big-integer";
import store from "@redux/Store";
import {
  Transaction,
  Operation,
  RosettaTransaction,
  Asset,
  HPLSubAccount,
  ResQueryState,
  HPLVirtualSubAcc,
  HPLAsset,
  HPLData,
  HplRemote,
  HPLAssetData,
  HPLSubData,
  HPLVirtualData,
} from "./redux/models/AccountModels";
import { IcrcTokenMetadataResponse, IcrcAccount, encodeIcrcAccount } from "@dfinity/ledger";
import {
  OperationStatusEnum,
  OperationTypeEnum,
  TransactionTypeEnum,
  TransactionType,
  SpecialTxTypeEnum,
} from "./const";
import { Account, Transaction as T } from "@dfinity/ledger/dist/candid/icrc1_index";
import HplDefaultIcon from "@assets/svg/files/defaultHPL.svg";
import { isNullish, uint8ArrayToHexString, bigEndianCrc32, encodeBase32 } from "@dfinity/utils";
import { AccountIdentifier, SubAccount as SubAccountNNS } from "@dfinity/nns";
import { AccountState, AccountType, AssetId, FtSupply, RemoteId, SubId, Time, VirId } from "@candid/HPL/service.did";
import { FungibleToken } from "@candid/Dictionary/dictService.did";
import { FungibleTokenLocal } from "@redux/models/TokenModels";

export const MILI_PER_SECOND = 1000000;

export const getEncodeCrc = ({ owner, subaccount }: IcrcAccount): string => {
  const crc = bigEndianCrc32(Uint8Array.from([...owner.toUint8Array(), ...(subaccount || toUint8Array(0))]));
  return encodeBase32(crc);
};

export const hexToNumber = (hexFormat: string) => {
  if (hexFormat.slice(0, 2) !== "0x") return undefined;
  const hex = hexFormat.substring(2);
  if (/^[a-fA-F0-9]+$/.test(hex)) {
    let numb = bigInt();
    for (let index = 0; index < hex.length; index++) {
      const digit = hex[hex.length - index - 1];
      numb = numb.add(
        bigInt(16)
          .pow(bigInt(index))
          .multiply(bigInt(`0x${digit}`)),
      );
    }
    return numb;
  } else {
    return undefined;
  }
};

export const checkHexString = (e: string) => {
  let hexValue = e.trim();
  if (e.trim().slice(0, 2).toLowerCase() === "0x") hexValue = hexValue.substring(2);
  return (hexValue === "" || /^[a-fA-F0-9]+$/.test(hexValue)) && hexValue.length < 65;
};

export const getICRC1Acc = ({ owner, subaccount }: IcrcAccount): string => {
  const crc = encodeIcrcAccount({ owner, subaccount });
  return crc;
};

export const getFirstNFrom = (address: string, digits: number) => {
  return `${address.slice(0, digits).toUpperCase()}`;
};

export const getFirstNChars = (str: string, digits: number) => {
  if (str.length > digits) return `${str.slice(0, digits)}...`;
  else return str;
};

export const shortAddress = (address: string, digitsL: number, digitsR: number, prefix?: string, sufix?: string) => {
  if (address.length > digitsL + digitsR)
    return `${prefix ? prefix : ""}${address.slice(0, digitsL)} ... ${address.slice(-digitsR)}${sufix ? sufix : ""}`;
  else return address;
};

export const shortPrincipals = (
  princ: string,
  groupsL: number,
  groupsR: number,
  prefix?: string,
  sufix?: string,
  minGroups?: number,
) => {
  const groups = princ.split("-");
  if (groups.length > (minGroups ? minGroups + 1 : groupsL + groupsR)) {
    let left = "";
    for (let index = 0; index < groupsL; index++) {
      left = left + groups[index] + "-";
    }
    let right = "";
    for (let index = 0; index < groupsR; index++) {
      right = "-" + groups[groups.length - 1 - index] + right;
    }
    return `${prefix ? prefix : ""}${left} ... ${right}${sufix ? sufix : ""}`;
  } else return princ;
};

export const getContactColor = (idx: number) => {
  if (idx % 3 === 0) return "bg-ContactColor1";
  else if (idx % 3 === 1) return "bg-ContactColor2";
  else return "bg-ContactColor3";
};

export const principalToAccountIdentifier = (p: string, s?: number[] | number) => {
  const padding = Buffer.from("\x0Aaccount-id");
  const array = new Uint8Array([...padding, ...Principal.fromText(p).toUint8Array(), ...getSubAccountArray(s)]);
  const hash = sha224(array);
  const checksum = to32bits(getCrc32(hash));
  const array2 = new Uint8Array([...checksum, ...hash]);
  return array2;
};

export const roundToDecimalN = (numb: number | string, decimal: number | string) => {
  return Math.round(Math.round(Number(numb) * Math.pow(10, Number(decimal))) / Math.pow(10, Number(decimal)));
};

export const toFullDecimal = (numb: bigint | string, decimal: number, maxDecimals?: number) => {
  if (BigInt(numb) === BigInt(0)) return "0";

  let numbStr = numb.toString();
  if (decimal === numbStr.length) {
    if (maxDecimals === 0) return "0";
    const newNumber = numbStr.slice(0, maxDecimals || decimal).replace(/0+$/, "");
    return "0." + newNumber;
  } else if (decimal > numbStr.length) {
    for (let index = 0; index < decimal; index++) {
      numbStr = "0" + numbStr;
      if (numbStr.length > decimal) break;
    }
  }
  const holeStr = numbStr.slice(0, numbStr.length - decimal).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (maxDecimals === 0) return holeStr;

  const decimalStr = numbStr.slice(numbStr.length - decimal).replace(/0+$/, "");
  if (decimalStr === "") {
    return holeStr;
  } else {
    const newNumber = holeStr + "." + decimalStr.slice(0, maxDecimals || decimal);
    if (Number(newNumber) === 0) return "0";
    else return holeStr + "." + decimalStr.slice(0, maxDecimals || decimal);
  }
};

export function getDecimalAmount(numb: number | string, decimal: number | string, direct?: boolean) {
  if (Number(numb) === 0) return "0";
  const x = Number(numb) / Math.pow(10, Number(decimal));
  return direct ? x.toString() : x.toLocaleString("en-US", { maximumFractionDigits: 20 });
}

export const toHoleBigInt = (numb: string, decimal: number) => {
  const parts = numb.split(".");
  if (parts.length === 1 || parts[1] === "") {
    let addZeros = "";
    for (let index = 0; index < decimal; index++) {
      addZeros = "0" + addZeros;
    }
    return BigInt(parts[0].replace(/,/g, "") + addZeros);
  } else {
    const hole = parts[0].replace(/,/g, "");
    const dec = parts[1];
    let addZeros = "";
    for (let index = 0; index < decimal - dec.length; index++) {
      addZeros = "0" + addZeros;
    }
    return BigInt(hole + dec + addZeros);
  }
};

export const validateAmount = (amnt: string, dec: number): boolean => {
  // Regular expression to match a valid number with at most 'dec' decimals
  const regex = new RegExp(`^[0-9]+([.,][0-9]{0,${dec}})?$`);
  // Check if amount is a valid number
  if (!regex.test(amnt)) {
    return false;
  }
  // Additional check for decimal places
  const decimalPart = amnt.split(/[.,]/)[1];
  if (decimalPart && decimalPart.length > dec) {
    return false;
  }
  return true;
};

export function getHoleAmount(amount: string, decimal: string | number, asBigInt?: boolean) {
  let amnt = amount;
  if (amount.at(-1) === ".") amnt = amnt.slice(0, -1);
  else if (amount === "") amnt = "0";

  const newAmnt = Math.round(Number(amnt) * Math.pow(10, Number(decimal)));

  if (asBigInt) return BigInt(newAmnt);
  else return newAmnt;
}

export const getUSDfromToken = (
  tokenAmount: string | number,
  marketPrice: string | number,
  decimal: string | number,
) => {
  return ((Number(tokenAmount) * Number(marketPrice)) / Math.pow(10, Number(decimal))).toFixed(2);
};

export const removeLeadingZeros = (text: string): string => text.replace(/^0+/, "");

export const getSubAccountNumber = (subaccount?: Uint8Array, prefix?: string, sufix?: string) => {
  if (isNullish(subaccount)) return `${prefix ? prefix : ""}0${sufix ? sufix : ""}`;

  const subaccountText = removeLeadingZeros(uint8ArrayToHexString(subaccount));

  if (subaccountText.length === 0) {
    return `${prefix ? prefix : ""}0${sufix ? sufix : ""}`;
  }
  return `${prefix ? prefix : ""}${subaccountText}${sufix ? sufix : ""}`;
};

export const getSubAccountUint8Array = (subaccount: string | number) => {
  return new Uint8Array(getSubAccountArray(Number(subaccount)));
};

export const getSubAccountArray = (s?: number[] | number) => {
  if (Array.isArray(s)) {
    return s.concat(Array(32 - s.length).fill(0));
  } else {
    return Array(28)
      .fill(0)
      .concat(to32bits(s ? s : 0));
  }
};

export const hexToUint8Array = (hex: string) => {
  const zero = bigInt(0);
  const n256 = bigInt(256);
  let bigNumber = hexToNumber(hex);
  if (bigNumber) {
    const result = new Uint8Array(32);
    let i = 0;
    while (bigNumber.greater(zero)) {
      result[32 - i - 1] = bigNumber.mod(n256).toJSNumber();
      bigNumber = bigNumber.divide(n256);
      i += 1;
    }
    return result;
  } else return new Uint8Array(32);
};

export const subUint8ArrayToHex = (sub: Uint8Array | undefined) => {
  if (sub) {
    const hex = removeLeadingZeros(Buffer.from(sub).toString("hex"));
    if (hex === "") return "0";
    else return hex;
  } else {
    return "0";
  }
};

export const to32bits = (num: number) => {
  const b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
};

export const toUint8Array = (num: number) => {
  return new Uint8Array(num);
};

export const toNumberFromUint8Array = (Uint8Arr: Uint8Array) => {
  const size = Uint8Arr.length;
  const buffer = Buffer.from(Uint8Arr);
  const result = buffer.readUIntBE(0, size);
  return result;
};

export const getAddress = (
  type: TransactionType,
  fromAddress: string,
  fromSub: string,
  accountAddres: string,
  accountSub: string,
) => {
  if (type !== TransactionTypeEnum.Enum.NONE) {
    if (type === TransactionTypeEnum.Enum.RECEIVE) {
      return false;
    } else {
      return true;
    }
  } else {
    if (accountAddres !== fromAddress) {
      return false;
    } else {
      if (fromSub === accountSub) {
        return true;
      } else {
        return false;
      }
    }
  }
};

export const getICPSubaccountsArray = async () => {
  const sub: string[] = [];
  const myAgent = store.getState().auth.userAgent;
  const myPrincipal = await myAgent.getPrincipal();

  for (let index = 0; index <= 10; index++) {
    sub[index] = AccountIdentifier.fromPrincipal({
      principal: myPrincipal,
      subAccount: SubAccountNNS.fromID(Number(index)),
    }).toHex();
  }

  return sub;
};

export const getAccountIdentifier = (pricipal: string, sub: number) => {
  return AccountIdentifier.fromPrincipal({
    principal: Principal.fromText(pricipal),
    subAccount: SubAccountNNS.fromID(Number(sub)),
  }).toHex();
};

export const formatIcpTransaccion = (
  accountId: string,
  rosettaTransaction: RosettaTransaction,
  blockHash: string,
): Transaction => {
  const {
    operations,
    metadata: { timestamp, block_height },
    transaction_identifier: { hash },
  } = rosettaTransaction;
  const transaction = { status: OperationStatusEnum.Enum.COMPLETED } as Transaction;
  operations?.forEach((operation: Operation, i: number) => {
    const value = BigInt(operation.amount.value);
    const amount = value.toString();
    if (operation.type === OperationTypeEnum.Enum.FEE) {
      transaction.fee = amount;
      return;
    }

    if (value > 0) {
      transaction.to = operation.account.address;
    } else if (value < 0) {
      transaction.from = operation.account.address;
    } else {
      if (i === 0) {
        transaction.from = operation.account.address;
      }
      if (i === 1) {
        transaction.to = operation.account.address;
      }
    }

    if (
      transaction.status === OperationStatusEnum.Enum.COMPLETED &&
      operation.status !== OperationStatusEnum.Enum.COMPLETED
    )
      transaction.status = operation.status;

    transaction.type = transaction.to === accountId ? TransactionTypeEnum.Enum.RECEIVE : TransactionTypeEnum.Enum.SEND;
    transaction.amount = amount;
    transaction.canisterId = import.meta.env.VITE_ICP_LEDGER_CANISTER_ID;
    transaction.idx = block_height.toString();
    transaction.symbol = operation.amount.currency.symbol;
  });

  return {
    ...transaction,
    hash: hash + "-" + blockHash,
    timestamp: Math.floor(timestamp / MILI_PER_SECOND),
  } as Transaction;
};

export const formatckBTCTransaccion = (
  ckBTCTransaction: T,
  id: bigint,
  principal: string,
  symbol: string,
  canister: string,
  subNumber?: string,
): Transaction => {
  const { timestamp, transfer, mint, burn, kind } = ckBTCTransaction;
  const trans = { status: OperationStatusEnum.Enum.COMPLETED, kind: kind } as Transaction;
  // Check Tx type ["transfer", "mint", "burn"]
  if (kind === SpecialTxTypeEnum.Enum.mint)
    mint.forEach(
      (operation: { to: Account; memo: [] | [Uint8Array]; created_at_time: [] | [bigint]; amount: bigint }) => {
        // Get Tx data from Mint record
        const value = operation.amount;
        const amount = value.toString();
        trans.to = (operation.to.owner as Principal).toString();
        if (operation.to.subaccount.length > 0)
          trans.toSub = `0x${subUint8ArrayToHex((operation.to.subaccount as [Uint8Array])[0])}`;
        else trans.toSub = "0x0";
        trans.from = "";
        trans.fromSub = "";
        trans.canisterId = canister;
        trans.symbol = symbol;
        trans.amount = amount;

        // Get AccountIdentifier of Receiver
        let subaccTo: SubAccountNNS | undefined = undefined;
        try {
          subaccTo = SubAccountNNS.fromBytes((operation.to.subaccount as [Uint8Array])[0]) as SubAccountNNS;
        } catch {
          subaccTo = undefined;
        }
        trans.idx = id.toString();
        trans.identityTo = AccountIdentifier.fromPrincipal({
          principal: operation.to.owner as Principal,
          subAccount: subaccTo,
        }).toHex();
        trans.type = TransactionTypeEnum.Enum.RECEIVE;
      },
    );
  else if (kind === SpecialTxTypeEnum.Enum.burn)
    burn.forEach(
      // Get Tx data from Burn record
      (operation: { from: Account; memo: [] | [Uint8Array]; created_at_time: [] | [bigint]; amount: bigint }) => {
        const value = operation.amount;
        const amount = value.toString();
        trans.from = (operation.from.owner as Principal).toString();
        if (operation.from.subaccount.length > 0)
          trans.fromSub = `0x${subUint8ArrayToHex((operation.from.subaccount as [Uint8Array])[0])}`;
        else trans.fromSub = "0x0";
        trans.to = "";
        trans.toSub = "";
        trans.canisterId = canister;
        trans.symbol = symbol;
        trans.amount = amount;

        // Get AccountIdentifier of Sender
        let subaccFrom: SubAccountNNS | undefined = undefined;
        try {
          subaccFrom = SubAccountNNS.fromBytes((operation.from.subaccount as [Uint8Array])[0]) as SubAccountNNS;
        } catch {
          subaccFrom = undefined;
        }
        trans.idx = id.toString();
        trans.identityFrom = AccountIdentifier.fromPrincipal({
          principal: operation.from.owner as Principal,
          subAccount: subaccFrom,
        }).toHex();
        trans.type = TransactionTypeEnum.Enum.SEND;
      },
    );
  else
    transfer?.forEach((operation: any) => {
      // Get Tx data from transfer record
      const value = operation.amount;
      const amount = value.toString();
      trans.to = (operation.to.owner as Principal).toString();
      trans.from = (operation.from.owner as Principal).toString();

      if (operation.to.subaccount.length > 0)
        trans.toSub = `0x${subUint8ArrayToHex((operation.to.subaccount as [Uint8Array])[0])}`;
      else trans.toSub = "0x0";

      if (operation.from.subaccount.length > 0)
        trans.fromSub = `0x${subUint8ArrayToHex((operation.from.subaccount as [Uint8Array])[0])}`;
      else trans.fromSub = "0x0";

      const subCheck = subNumber;
      if (trans.from === principal && trans.fromSub === subCheck) {
        trans.type = TransactionTypeEnum.Enum.SEND;
      } else {
        trans.type = TransactionTypeEnum.Enum.RECEIVE;
      }

      trans.canisterId = canister;
      trans.symbol = symbol;
      trans.amount = amount;
      trans.idx = id.toString();

      // Get AccountIdentifier of Receiver
      let subaccTo: SubAccountNNS | undefined = undefined;
      try {
        subaccTo = SubAccountNNS.fromBytes((operation.to.subaccount as [Uint8Array])[0]) as SubAccountNNS;
      } catch {
        subaccTo = undefined;
      }
      trans.identityTo = AccountIdentifier.fromPrincipal({
        principal: operation.to.owner as Principal,
        subAccount: subaccTo,
      }).toHex();

      // Get AccountIdentifier of Sender
      let subaccFrom: SubAccountNNS | undefined = undefined;
      try {
        subaccFrom = SubAccountNNS.fromBytes((operation.to.subaccount as [Uint8Array])[0]) as SubAccountNNS;
      } catch {
        subaccFrom = undefined;
      }
      trans.identityFrom = AccountIdentifier.fromPrincipal({
        principal: operation.from.owner as Principal,
        subAccount: subaccFrom,
      }).toHex();
    });
  return {
    ...trans,
    timestamp: Math.floor(Number(timestamp) / MILI_PER_SECOND),
  } as Transaction;
};

export const getMetadataInfo = (myMetadata: IcrcTokenMetadataResponse) => {
  let symbol = "symbol";
  let name = "symbol";
  let decimals = 0;
  let logo = "";
  let fee = "";

  myMetadata.map((dt) => {
    if (dt[0] === "icrc1:symbol") {
      const auxSymbol = dt[1] as { Text: string };
      symbol = auxSymbol.Text;
    }
    if (dt[0] === "icrc1:name") {
      const auxName = dt[1] as { Text: string };
      name = auxName.Text;
    }
    if (dt[0] === "icrc1:decimals") {
      const auxDec = dt[1] as any;
      decimals = Number(auxDec.Nat);
    }
    if (dt[0] === "icrc1:logo") {
      const auxName = dt[1] as { Text: string };
      logo = auxName.Text;
    }
    if (dt[0] === "icrc1:fee") {
      const auxName = dt[1] as any;
      fee = String(auxName.Nat);
    }
  });

  return { symbol, name, decimals, logo, fee };
};

export const getInitialFromName = (name: string, length: number) => {
  if (name.length === 0) {
    return "";
  } else {
    const names = name.split(" ");
    let initials = "";
    names.map((nm) => {
      if (nm.trim().length > 0) initials = initials + nm.trim()[0];
    });
    return initials.toUpperCase().slice(0, length);
  }
};

export const getPxlCode = (prinCode: string, vtId: string) => {
  const id = BigInt(prinCode).toString(16);
  const link = BigInt(vtId).toString(16);
  return (link.length - 1).toString(16) + id + link;
};

export const getOwnerInfoFromPxl = (code: string) => {
  try {
    if (code.length > 2) {
      const size = Number(`0x${code[0]}`) + 1;
      const princCode = BigInt(`0x${code.slice(1, code.length - size)}`);
      return { ownerId: princCode, linkId: BigInt(`0x${code.slice(-size)}`).toString() };
    } else return undefined;
  } catch {
    return undefined;
  }
};

export const checkPxlCode = (code: string) => {
  const firstDigit = Number(`0x${code[0]}`);
  if (!checkHexString(code) || code.length < 3) return false;
  else if (code.length <= firstDigit + 2) return false;
  else if (firstDigit > 0) {
    const size = firstDigit + 1;
    const minValue = BigInt(`0x${"f".repeat(firstDigit)}`);
    const value = BigInt(`0x${code.slice(-size)}`);
    if (minValue >= value) return false;
  }
  return true;
};

export const getAssetSymbol = (symbol: string, assets: Array<Asset>) => {
  return assets.find((a: Asset) => {
    return a.tokenSymbol === symbol;
  })?.symbol;
};

export const parseFungibleToken = (tokens: FungibleToken[]) => {
  const auxTkns: FungibleTokenLocal[] = [];
  tokens.map((tkn) => {
    auxTkns.push({
      creation_time: Number(tkn.creation_time),
      assetId: tkn.assetId.toString(),
      logo: tkn.logo.toString(),
      name: tkn.name.toString(),
      modification_time: Number(tkn.modification_time),
      displaySymbol: tkn.displaySymbol.toString(),
      symbolKey: tkn.symbolKey.toString(),
    });
  });
  return auxTkns;
};

export const formatHPLSubaccounts = (
  hplData: HPLData,
  dictFT: FungibleTokenLocal[],
  stateData: ResQueryState,
  adminAccountState: Array<[bigint, { ft: bigint }]>,
  owner: string,
) => {
  const auxSubaccounts: HPLSubAccount[] = [];

  stateData.accounts.map((sa) => {
    const subData = hplData.sub.find((sub) => sub.id === sa[0].toString());

    const auxVirtuals: HPLVirtualSubAcc[] = [];
    stateData.virtualAccounts.map(async (va) => {
      const vtData = hplData.vt.find((vt) => vt.id === va[0].toString());
      if (va[1][1] === sa[0]) {
        const newCode = getPxlCode(owner, va[0].toString());
        auxVirtuals.push({
          name: vtData ? vtData.name : "",
          virt_sub_acc_id: va[0].toString(),
          amount: va[1][0].ft.toString(),
          currency_amount: "0.00",
          expiration: Math.trunc(Number(va[1][2].toString()) / 1000000),
          accesBy: vtData ? vtData.accesBy : "",
          backing: va[1][1].toString(),
          code: newCode,
        });
      }
    });

    auxSubaccounts.push({
      name: subData ? subData.name : "",
      sub_account_id: sa[0].toString(),
      amount: sa[1].ft.toString(),
      currency_amount: "0.00",
      transaction_fee: "0",
      ft: subData ? subData.ftId : "0",
      virtuals: auxVirtuals,
    });
  });
  const auxFT: HPLAsset[] = getFtsFormated(stateData.ftSupplies, hplData.ft, dictFT, adminAccountState);
  return { auxSubaccounts, auxFT };
};

export const getFtsFormated = (
  ftSupplies: Array<[AssetId, FtSupply]>,
  ftsData: HPLAssetData[],
  dictFT: FungibleTokenLocal[],
  adminAccountState: Array<[bigint, { ft: bigint }]>,
) => {
  const auxFT: HPLAsset[] = [];
  ftSupplies.map((asst) => {
    const ftData = ftsData.find((ft) => ft.id === asst[0].toString());
    const ftDict = dictFT.find((ft) => ft.assetId === asst[0].toString());
    const ftAdmin = adminAccountState.find((ft) => ft[0] === asst[0]);
    auxFT.push({
      id: asst[0].toString(),
      name: ftData ? ftData.name : "",
      token_name: ftDict ? ftDict.name : "",
      symbol: ftData ? ftData.symbol : "",
      token_symbol: ftDict ? ftDict.displaySymbol : "",
      decimal: ftData ? Number(ftData.decimals) : 0,
      description: ftData ? ftData.description : "",
      logo: ftDict ? ftDict.logo : "",
      controller: ftData ? ftData.controller : "",
      supply: asst[1].toString(),
      ledgerBalance: ftAdmin ? ftAdmin[1].ft.toString() : "0",
    });
  });
  return auxFT;
};

export const formatAccountInfo = (accInfo: Array<[SubId, AccountType]>, accLocal: HPLSubData[]) => {
  return accInfo.map((acc) => {
    const found = accLocal.find((accL) => accL.id === acc[0].toString());
    const accData: HPLSubData = {
      id: acc[0].toString(),
      name: found?.name || "",
      ftId: acc[1].ft.toString(),
    };
    return accData;
  });
};
export const formatVirtualAccountInfo = (
  vtInfo: Array<[VirId, [AccountType, Principal]]>,
  vtLocal: HPLVirtualData[],
) => {
  return vtInfo.map((vt) => {
    const found = vtLocal.find((vtL) => vtL.id === vt[0].toString());
    const accData: HPLVirtualData = {
      id: vt[0].toString(),
      name: found?.name || "",
      ftId: vt[1][0].ft.toString(),
      accesBy: vt[1][1].toText(),
    };
    return accData;
  });
};
export const formatFtInfo = (
  ftInfo: Array<
    [
      AssetId,
      {
        controller: Principal;
        decimals: number;
        description: string;
      },
    ]
  >,
  ftLocal: HPLAssetData[],
) => {
  return ftInfo.map((ft) => {
    const found = ftLocal.find((ftL) => ftL.id === ft[0].toString());
    const accData: HPLAssetData = {
      id: ft[0].toString(),
      name: found?.name || "",
      symbol: found?.symbol || "",
      controller: ft[1].controller.toText(),
      decimals: ft[1].decimals.toFixed(0),
      description: ft[1].description,
    };
    return accData;
  });
};

export const getUpdatedFts = (dictFT: FungibleToken[], fts: HPLAsset[]) => {
  const auxFT: HPLAsset[] = [];
  fts.map((asst) => {
    const ftDict = dictFT.find((ft) => ft.assetId.toString() === asst.id);
    auxFT.push({
      ...asst,
      token_symbol: ftDict ? ftDict.displaySymbol : asst.token_symbol,
      token_name: ftDict ? ftDict.name : asst.token_name,
    });
  });

  return auxFT;
};

export const formatHplRemotes = (
  info: Array<[RemoteId, AccountType]>,
  state: Array<[RemoteId, [AccountState, Time]]>,
  principal?: string,
) => {
  const auxRemotes: HplRemote[] = [];
  info.map((rmtInfo) => {
    const rmtState = state.find((rmtState) => rmtInfo[0][1] === rmtState[0][1]);
    if (rmtState) {
      auxRemotes.push({
        name: "",
        index: rmtInfo[0][1].toString(),
        status: "",
        expired: Number(rmtState[1][1]),
        amount: rmtState[1][0].ft.toString(),
        ftIndex: rmtInfo[1].ft.toString(),
        code: principal ? getPxlCode(principal, rmtInfo[0][1].toString()) : "",
      });
    }
  });

  return auxRemotes;
};

export const getDisplaySymbolFromFt = (ft: HPLAsset) => {
  return ft.symbol === "" ? (ft.token_symbol === "" ? "" : ft.token_symbol) : ft.symbol;
};
export const getDisplayNameFromFt = (ft: HPLAsset, t?: any, emptyFormat?: boolean) => {
  if (ft.name === "")
    if (ft.symbol === "")
      if (ft.token_symbol === "") {
        return emptyFormat ? "" : `[ ${t ? t("asset") : "Asset"} ${ft.id} ]`;
      } else {
        return ft.token_name;
      }
    else {
      return emptyFormat ? "" : `[ ${t ? t("asset") : "Asset"} ${ft.id} ]`;
    }
  else {
    return ft.name;
  }
};

export const getLogoString = (ft: HPLAsset) => {
  if (ft.name !== "" || ft.symbol !== "" || ft.logo === "") return HplDefaultIcon;
  else return ft.logo;
};

export const numToUint32Array = (num: number) => {
  let arr = new Uint8Array(32);

  for (let i = 31; i >= 0; i--) {
    arr[i] = num % 4294967296;
    num = Math.floor(num / 4294967296);
  }

  return arr;
};
