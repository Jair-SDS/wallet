import { FungibleToken } from "@candid/Dictionary/dictService.did";
import {
  HPLAsset,
  HPLAssetData,
  HPLData,
  HPLSubAccount,
  HPLSubData,
  HPLVirtualData,
  HPLVirtualSubAcc,
  HplRemote,
  ResQueryState,
} from "@redux/models/AccountModels";
import { FungibleTokenLocal } from "@redux/models/TokenModels";
import { AccountType, AssetId, VirId } from "@research-ag/hpl-client/dist/candid/ledger";
import HplDefaultIcon from "@assets/svg/files/defaultHPL.svg";
import { Principal } from "@dfinity/principal";
import { Expiration } from "@candid/HPL/service.did";
import { checkHexString } from "./hexadecimal";

export const parseFungibleToken = (tokens: FungibleToken[]) => {
  const auxTkns: FungibleTokenLocal[] = [];
  tokens.map((tkn) => {
    auxTkns.push({
      creation_time: Number(tkn.createdAt),
      assetId: tkn.assetId.toString(),
      logo: tkn.logo,
      name: tkn.name,
      modification_time: Number(tkn.modifiedAt),
      symbol: tkn.symbol,
    });
  });
  return auxTkns;
};

export const getFtsFormated = (
  ftSupplies: Array<[AssetId, bigint]>,
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
      token_symbol: ftDict ? ftDict.symbol : "",
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

export const getLogoString = (ft: HPLAsset) => {
  if (ft.name !== "" || ft.symbol !== "" || ft.logo === "") return HplDefaultIcon;
  else return ft.logo;
};

export const formatHPLSubaccounts = (
  hplData: HPLData,
  dictFT: FungibleTokenLocal[],
  stateData: ResQueryState,
  adminAccountState: Array<[bigint, { ft: bigint }]>,
  owner: string,
) => {
  const auxFullVirtuals: HPLVirtualSubAcc[] = [];

  stateData.virtualAccounts.map(async (va) => {
    const vtData = hplData.vt.find((vt) => vt.id === va[0].toString());
    const newCode = getPxlCode(owner, va[0].toString());
    auxFullVirtuals.push({
      name: vtData ? vtData.name : "",
      virt_sub_acc_id: va[0].toString(),
      amount: va[1][0].ft.toString(),
      currency_amount: "0.00",
      expiration: Math.trunc(Number(va[1][2].toString()) / 1000000),
      accesBy: vtData ? vtData.accesBy : "",
      backing: va[1][1].toString(),
      code: newCode,
      isMint: vtData ? vtData.isMint : false,
    });
  });

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
          isMint: vtData ? vtData.isMint : false,
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
  return { auxSubaccounts, auxFT, auxFullVirtuals };
};

export const getPxlCode = (prinCode: string, vtId: string) => {
  const id = BigInt(prinCode).toString(16);
  const link = BigInt(vtId).toString(16);
  return (link.length - 1).toString(16) + id + link;
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

export const formatVirtualAccountInfo = (
  vtInfo: Array<[VirId, [AccountType, Principal]]>,
  vtLocal: HPLVirtualData[],
  princMints: string[],
) => {
  return vtInfo.map((vt) => {
    const found = vtLocal.find((vtL) => vtL.id === vt[0].toString());
    const mint = princMints.find((mnt) => mnt === vt[1][1].toText());
    const accData: HPLVirtualData = {
      id: vt[0].toString(),
      name: found?.name || "",
      ftId: vt[1][0].ft.toString(),
      accesBy: vt[1][1].toText(),
      isMint: !!mint,
    };
    return accData;
  });
};

export const formatAccountInfo = (accInfo: Array<[bigint, AccountType]>, accLocal: HPLSubData[]) => {
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

export const formatHplRemotes = (
  info: Array<[[Principal, bigint], { ft: AssetId }]>,
  state: Array<[[Principal, bigint], [{ ft: bigint }, Expiration]]>,
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
