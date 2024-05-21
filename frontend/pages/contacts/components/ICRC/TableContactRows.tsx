// svgs
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as ChevIcon } from "@assets/svg/files/chev-icon.svg";
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import ContactAssetPop from "./contactAssetPop";
import TableAssets from "./tableAssets";
import { CustomCopy } from "@components/tooltip";
import { CustomInput } from "@components/input";
import { ReactComponent as MoneyHandIcon } from "@assets/svg/files/money-hand.svg";
import { Fragment, ChangeEvent } from "react";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { clsx } from "clsx";
import { Principal } from "@dfinity/principal";
import { AssetToAdd } from "@redux/models/AccountModels";
import usePrincipalValidator from "../../hooks/usePrincipalValidator";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import useContactTable from "../../hooks/useContactTable";
import { DeleteContactTypeEnum } from "@/common/const";
import {
  AssetContact,
  Contact,
  NewContactSubAccount,
  SubAccountContact,
  SubAccountContactErr,
} from "@redux/models/ContactsModels";
import { useTranslation } from "react-i18next";
import { getAssetIcon } from "@/common/utils/icons";
import { getInitialFromName } from "@common/utils/strings";
import { shortAddress } from "@common/utils/icrc";

interface TableContactRowsProps {
  changeName(value: string): void;
  setDeleteType(value: DeleteContactTypeEnum): void;
  setDeleteObject(value: NewContactSubAccount): void;
  setSubaccEdited(value: SubAccountContact): void;
  setSubaccEditedErr(value: SubAccountContactErr): void;
  changeSubIdx(value: string): void;
  setDeleteModal(value: boolean): void;
  subaccEdited: SubAccountContact;
  subaccEditedErr: SubAccountContactErr;
  searchKey: string;
  assetFilter: string[];
}

export default function TableContactRows(props: TableContactRowsProps) {
  const { t } = useTranslation();
  const { contacts, checkPrincipalValid } = usePrincipalValidator();
  const { assets } = GeneralHook();
  const {
    selContactPrin,
    setSelContactPrin,
    // updateContact,
    addAsset,
    selCntcPrinAddAsst,
    setSelCntcPrinAddAsst,
    contactEdited,
    setContactEdited,
    openSubaccToken,
    setOpenSubaccToken,
    openAssetsPrin,
    setOpenAssetsPrin,
    selSubaccIdx,
    setSelSubaccIdx,
    contactEditedErr,
    setContactEditedErr,
    addSub,
    setAddSub,
  } = useContactTable();

  const {
    changeName,
    setDeleteType,
    setDeleteObject,
    setSubaccEdited,
    setSubaccEditedErr,
    changeSubIdx,
    setDeleteModal,
    subaccEdited,
    subaccEditedErr,
    searchKey,
    assetFilter,
  } = props;

  return (
    <tbody>
      {getContactsToShow().map((cntc, k) => {
        const hasContactAllowance = cntc?.assets.some((asset) =>
          asset.subaccounts.some((subaccount) => subaccount?.allowance?.allowance),
        );

        return (
          <Fragment key={k}>
            <tr className={contactStyle(cntc)}>
              <td className="">
                <div className="relative flex flex-row items-center justify-start w-full gap-2 px-4 min-h-14">
                  {(cntc.principal === selContactPrin ||
                    cntc.principal === openAssetsPrin ||
                    cntc.principal === selCntcPrinAddAsst) && (
                    <div className="absolute left-0 w-1 h-14 bg-SelectRowColor"></div>
                  )}
                  {cntc.principal === selContactPrin ? (
                    <CustomInput
                      intent={"primary"}
                      border={contactEditedErr.name ? "error" : "selected"}
                      sizeComp={"xLarge"}
                      sizeInput="small"
                      value={contactEdited.name}
                      onChange={onContactNameChange}
                    />
                  ) : (
                    <div className="flex flex-row items-center justify-start w-full gap-2">
                      <div
                        className={`flex justify-center items-center !min-w-[2rem] w-8 h-8 rounded-md ${getContactColor(
                          k,
                        )}`}
                      >
                        <p className="text-PrimaryTextColor">{getInitialFromName(cntc.name, 2)}</p>
                      </div>
                      <p className="text-left opacity-70 break-words max-w-[14rem]">{cntc.name}</p>
                      {hasContactAllowance && (
                        <MoneyHandIcon className="relative w-5 h-5 cursor-pointer fill-RadioCheckColor" />
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-row items-center justify-start gap-2 px-2 opacity-70">
                  <p>{shortAddress(cntc.principal, 12, 9)}</p>
                  <CustomCopy size={"xSmall"} className="p-0" copyText={cntc.principal} />
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-row items-center justify-center w-full">
                  <div
                    className={
                      "flex flex-row justify-between items-center w-28 h-8 rounded bg-black/10 dark:bg-white/10"
                    }
                  >
                    <p className="ml-2">{`${cntc.assets.length} ${t("assets")}`}</p>
                    <ContactAssetPop
                      compClass="flex flex-row justify-center items-center"
                      btnClass="!w-8 !h-8 bg-AddSecondaryButton rounded-l-none"
                      assets={getFilteredAssets(cntc)}
                      getAssetIcon={getAssetIcon}
                      onAdd={(data) => {
                        onAddAssets(data, cntc);
                      }}
                      onOpen={() => {
                        onAddAssetPopOpen(cntc);
                      }}
                      onClose={() => {
                        setSelCntcPrinAddAsst("");
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-row items-start justify-center w-full gap-4">
                  {cntc.principal === selContactPrin ? (
                    <CheckIcon
                      onClick={() => {
                        onSave(cntc);
                      }}
                      className="w-4 h-4 opacity-50 cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
                    />
                  ) : (
                    <PencilIcon
                      onClick={() => {
                        onEditSubAccount(cntc);
                      }}
                      className="w-4 h-4 opacity-50 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor"
                    />
                  )}
                  {cntc.principal === selContactPrin ? (
                    <CloseIcon
                      onClick={onClose}
                      className="w-5 h-5 opacity-50 cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
                    />
                  ) : (
                    <TrashIcon
                      onClick={() => {
                        onDeleteSubAccount(cntc);
                      }}
                      className="w-4 h-4 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor"
                    />
                  )}
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-row items-start justify-center w-full gap-2">
                  <ChevIcon
                    onClick={() => {
                      onChevIconClic(cntc);
                    }}
                    className={`w-8 h-8 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor stroke-0  cursor-pointer ${
                      cntc.principal === openAssetsPrin ? "" : "rotate-90"
                    }`}
                  />
                </div>
              </td>
            </tr>
            {cntc.principal === openAssetsPrin && (
              <tr className="bg-SecondaryColorLight dark:bg-SecondaryColor">
                <td colSpan={5} className="w-full h-4 border-BorderColorTwoLight dark:border-BorderColorTwo">
                  <TableAssets
                    cntc={cntc}
                    openSubaccToken={openSubaccToken}
                    setOpenSubaccToken={setOpenSubaccToken}
                    setSelSubaccIdx={setSelSubaccIdx}
                    changeName={changeName}
                    addSub={addSub}
                    setAddSub={setAddSub}
                    setDeleteType={setDeleteType}
                    setDeleteObject={setDeleteObject}
                    setSelContactPrin={setSelContactPrin}
                    setSubaccEdited={setSubaccEdited}
                    setSubaccEditedErr={setSubaccEditedErr}
                    changeSubIdx={changeSubIdx}
                    setDeleteModal={setDeleteModal}
                    selSubaccIdx={selSubaccIdx}
                    subaccEdited={subaccEdited}
                    subaccEditedErr={subaccEditedErr}
                  ></TableAssets>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </tbody>
  );

  function getContactColor(idx: number) {
    if (idx % 3 === 0) return "bg-ContactColor1";
    else if (idx % 3 === 1) return "bg-ContactColor2";
    else return "bg-ContactColor3";
  }

  function getContactsToShow() {
    return contacts.filter((cntc) => {
      let incSubName = false;

      for (let i = 0; i < cntc.assets.length; i++) {
        const ast = cntc.assets[i];
        for (let j = 0; j < ast.subaccounts.length; j++) {
          const sa = ast.subaccounts[j];
          if (sa.name.toLowerCase().includes(searchKey.trim().toLowerCase())) {
            incSubName = true;
            break;
          }
        }
      }
      if (assetFilter.length === 0) {
        return (
          cntc.name.toLowerCase().includes(searchKey.trim().toLowerCase()) ||
          incSubName ||
          cntc.principal.toLowerCase().includes(searchKey.trim().toLowerCase())
        );
      } else {
        const astFilValid = assetFilter.some((astFil) => {
          return cntc.assets.find((ast) => ast.symbol === astFil);
        });

        return (
          (cntc.name.toLowerCase().includes(searchKey.trim().toLowerCase()) ||
            incSubName ||
            cntc.principal.toLowerCase().includes(searchKey.trim().toLowerCase())) &&
          astFilValid
        );
      }
    });
  }

  function onContactNameChange(e: ChangeEvent<HTMLInputElement>) {
    setContactEdited((prev: any) => {
      return { ...prev, name: e.target.value };
    });
    setContactEditedErr((prev: any) => {
      return { name: false, principal: prev.principal };
    });
  }

  function getFilteredAssets(cntc: Contact) {
    return assets.filter((ast) => {
      let isIncluded = false;
      cntc.assets.map((contAst) => {
        if (ast.tokenSymbol === contAst.tokenSymbol) isIncluded = true;
      });
      return !isIncluded;
    });
  }

  function onAddAssets(data: AssetToAdd[], cntc: Contact) {
    const auxAsst: AssetContact[] = data.map((dt) => {
      return {
        symbol: dt.symbol,
        tokenSymbol: dt.tokenSymbol,
        logo: dt.logo,
        subaccounts: [],
        address: dt.address,
        decimal: dt.decimal,
        shortDecimal: dt.shortDecimal,
        supportedStandards: dt.supportedStandards,
      };
    });
    addAsset(auxAsst, cntc.principal);
  }

  function onAddAssetPopOpen(cntc: Contact) {
    setSelCntcPrinAddAsst(cntc.principal);
    setAddSub(false);
    setSelSubaccIdx("");
    setSelContactPrin("");
  }

  function onSave(cntc: Contact) {
    setContactEditedErr({
      name: contactEdited.name.trim() === "",
      principal: contactEdited.principal !== cntc.principal && !checkPrincipalValid(contactEdited.principal),
    });

    if (
      contactEdited.name.trim() !== "" &&
      (checkPrincipalValid(contactEdited.principal) || contactEdited.principal === cntc.principal)
    ) {
      const updatedContact = {
        ...contactEdited,
        assets: cntc.assets,
        accountIdentier: AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(contactEdited.principal),
        }).toHex(),
      };
      console.log(updatedContact);
      // updateContact(updatedContact, cntc.principal);
      setSelContactPrin("");
    }
  }

  function onEditSubAccount(cntc: Contact) {
    setAddSub(false);
    setSelSubaccIdx("");
    setSelContactPrin(cntc.principal);
    setContactEdited(cntc);
    if (cntc.principal !== openAssetsPrin) {
      setOpenAssetsPrin("");
    }
    setContactEditedErr({ name: false, principal: false });
  }

  function onClose() {
    setSelContactPrin("");
    setSubaccEditedErr({ name: false, subaccount_index: false });
  }

  function onDeleteSubAccount(cntc: Contact) {
    setAddSub(false);
    setSelContactPrin("");
    setSelSubaccIdx("");
    setDeleteType(DeleteContactTypeEnum.Enum.CONTACT);
    let ttlSub = 0;
    cntc.assets.map((asst) => {
      ttlSub = ttlSub + asst.subaccounts.length;
    });
    setDeleteObject({
      principal: cntc.principal,
      name: cntc.name,
      tokenSymbol: "",
      symbol: "",
      subaccIdx: "",
      subaccName: "",
      totalAssets: cntc.assets.length,
      TotalSub: ttlSub,
    });
    setDeleteModal(true);
  }

  function onChevIconClic(cntc: Contact) {
    if (cntc.principal === openAssetsPrin) setOpenAssetsPrin("");
    else {
      if (cntc.assets.length > 0) {
        setContactEdited(cntc);
        setOpenAssetsPrin(cntc.principal);
      }
    }
    if (cntc.principal !== selContactPrin) setSelContactPrin("");
    setOpenSubaccToken("");
    setSelSubaccIdx("");
    setAddSub(false);
  }

  // Tailwind CSS
  function contactStyle(cntc: Contact) {
    return clsx({
      ["border-b border-BorderColorTwoLight dark:border-BorderColorTwo"]: true,
      ["bg-SelectRowColor/10"]: cntc.principal === selContactPrin || cntc.principal === selCntcPrinAddAsst,
      ["bg-SecondaryColorLight dark:bg-SecondaryColor"]:
        cntc.principal === openAssetsPrin && cntc.principal !== selContactPrin && cntc.principal !== selCntcPrinAddAsst,
    });
  }
}
