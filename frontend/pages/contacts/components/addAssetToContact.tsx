// svg
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-empty.svg";
//
import { CustomInput } from "@components/Input";
import ContactAssetElement from "./contactAssetElement";
import ContactAssetPop from "./contactAssetPop";
import { AssetContact, Contact, SubAccountContact } from "@redux/models/ContactsModels";
import { useTranslation } from "react-i18next";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { AssetToAdd } from "@redux/models/AccountModels";
import { checkHexString } from "@/utils";

interface AddAssetToContactProps {
  newContact: Contact;
  setNewContact(val: Contact): void;
  selAstContact: string;
  isValidSubacc(
    from: string,
    validContact: boolean,
    contAst?: AssetContact,
  ): { validSubaccounts: boolean; auxNewSub: SubAccountContact[]; errName: number[]; errId: number[] };
  isAvailableAddContact(): boolean;
  newSubAccounts: SubAccountContact[];
  setNewSubaccounts(val: SubAccountContact[]): void;
  newContactSubNameErr: number[];
  setNewContactSubNameErr(val: number[]): void;
  newContactSubIdErr: number[];
  setNewContactErr(val: string): void;
  setNewContactSubIdErr(val: number[]): void;
}

const AddAssetToContact = ({
  newContact,
  setNewContact,
  selAstContact,
  isValidSubacc,
  isAvailableAddContact,
  newSubAccounts,
  setNewSubaccounts,
  newContactSubNameErr,
  setNewContactSubNameErr,
  newContactSubIdErr,
  setNewContactErr,
  setNewContactSubIdErr,
}: AddAssetToContactProps) => {
  const { t } = useTranslation();
  const { assets, getAssetIcon, asciiHex } = GeneralHook();
  return (
    <div className="flex flex-row justify-start items-start w-full h-full">
      <div className="flex flex-col justify-start items-start w-[70%] h-full">
        <div className="flex flex-row justify-between items-center w-full p-3">
          <p className="whitespace-nowrap">{t("add.assets")}</p>
          {assets.filter((ast) => {
            let isIncluded = false;
            for (let index = 0; index < newContact.assets.length; index++) {
              if (newContact.assets[index].tokenSymbol === ast.tokenSymbol) {
                isIncluded = true;
                break;
              }
            }
            return !isIncluded;
          }).length !== 0 && (
            <ContactAssetPop
              assets={assets.filter((ast) => {
                let isIncluded = false;
                newContact.assets.map((contAst) => {
                  if (ast.tokenSymbol === contAst.tokenSymbol) isIncluded = true;
                });
                return !isIncluded;
              })}
              compClass="flex flex-row justify-end items-center w-full"
              getAssetIcon={getAssetIcon}
              onAdd={(data) => {
                assetToAdd(data);
              }}
            />
          )}
        </div>
        <div className="flex flex-col w-full h-full scroll-y-light">
          {newContact.assets.map((contAst, k) => {
            return (
              <ContactAssetElement
                key={k}
                contAst={contAst}
                k={k}
                selAstContact={selAstContact}
                isValidSubacc={() => {
                  isValidSubacc("change", true, contAst);
                }}
                isAvailableAddContact={isAvailableAddContact}
                newSubAccounts={newSubAccounts}
                setNewSubaccounts={setNewSubaccounts}
              ></ContactAssetElement>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col justify-start items-start w-full h-full p-3 bg-SecondaryColorLight dark:bg-SecondaryColor gap-4">
        <p>{`${t("sub-acc")} (${newSubAccounts.length})`}</p>
        <div className="flex flex-row justify-start items-start w-full gap-2 max-h-[15rem] scroll-y-light">
          <div className="flex flex-col justify-start items-start w-full gap-2">
            <p className="opacity-60">{t("name.sub.account")}</p>
            {newSubAccounts.map((newSA, k) => {
              return (
                <CustomInput
                  key={k}
                  sizeInput={"small"}
                  sizeComp={"small"}
                  intent={"primary"}
                  border={newContactSubNameErr.includes(k) ? "error" : undefined}
                  placeholder={t("name")}
                  value={newSA.name}
                  onChange={(e) => {
                    onChangeSubName(e.target.value, k);
                  }}
                />
              );
            })}
          </div>
          <div className="flex flex-col justify-start items-start w-[40%] gap-2">
            <p className="opacity-60">{t("sub-acc")}</p>
            {newSubAccounts.map((newSA, k) => {
              return (
                <div key={k} className="flex flex-row justify-start items-center w-full gap-2">
                  <CustomInput
                    sizeInput={"small"}
                    sizeComp={"small"}
                    intent={"primary"}
                    border={newContactSubIdErr.includes(k) ? "error" : undefined}
                    placeholder={"Hex"}
                    value={newSA.subaccount_index}
                    onChange={(e) => {
                      onchangeSubIdx(e.target.value, k);
                    }}
                    onKeyDown={(e) => {
                      onKeyPressSubIdx(e, newSA);
                    }}
                  />
                  <TrashIcon
                    onClick={() => {
                      onDeleteSubAccount(k);
                    }}
                    className="w-5 h-5 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
  function assetToAdd(data: AssetToAdd[]) {
    setNewContact({
      ...newContact,
      assets: [
        ...newContact.assets,
        ...data.map((ata) => {
          return {
            symbol: ata.symbol,
            subaccounts: [],
            tokenSymbol: ata.tokenSymbol,
            logo: ata.logo,
          };
        }),
      ],
    });
  }
  function onChangeSubName(value: string, k: number) {
    const auxSubs = [...newSubAccounts];
    auxSubs[k].name = value;
    setNewSubaccounts(auxSubs);
    setNewContactSubNameErr([...newContactSubNameErr].filter((num) => num !== k));
    setNewContactErr("");
  }
  function onchangeSubIdx(value: string, k: number) {
    if (checkHexString(value)) {
      const auxSubs = [...newSubAccounts];
      auxSubs[k].subaccount_index = value.trim();
      setNewSubaccounts(auxSubs);
      setNewContactSubIdErr([...newContactSubIdErr].filter((num) => num !== k));
      setNewContactErr("");
    }
  }
  function onKeyPressSubIdx(e: React.KeyboardEvent<HTMLInputElement>, newSA: SubAccountContact) {
    if (!asciiHex.includes(e.key)) {
      e.preventDefault();
    }
    if (newSA.subaccount_index.includes("0x") || newSA.subaccount_index.includes("0X")) {
      if (e.key === "X" || e.key == "x") {
        e.preventDefault();
      }
    }
  }
  function onDeleteSubAccount(k: number) {
    const auxSubs = [...newSubAccounts];
    auxSubs.splice(k, 1);
    setNewSubaccounts(auxSubs);
    setNewContactErr("");
  }
};

export default AddAssetToContact;
