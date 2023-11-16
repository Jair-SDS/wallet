// svg
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CustomInput } from "@components/Input";
import { useContacts } from "../../hooks/contactsHook";
import { CustomButton } from "@components/Button";
import ContactAssetPop from "./contactAssetPop";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { Contact } from "@redux/models/ContactsModels";
import { AssetToAdd } from "@redux/models/AccountModels";
import AddAssetToContact from "./addAssetToContact";
import { Principal } from "@dfinity/principal";

interface AddContactProps {
  setAddOpen(value: boolean): void;
}

const AddContact = ({ setAddOpen }: AddContactProps) => {
  const { t } = useTranslation();
  const {
    newContact,
    setNewContact,
    selAstContact,
    setSelAstContact,
    newSubAccounts,
    setNewSubaccounts,
    newContactErr,
    setNewContactErr,
    newContactNameErr,
    setNewContactNameErr,
    newContactPrinErr,
    setNewContactPrinErr,
    newContactSubNameErr,
    setNewContactSubNameErr,
    newContactSubIdErr,
    setNewContactSubIdErr,
    checkPrincipalValid,
    isValidSubacc,
    isAvailableAddContact,
  } = useContacts();
  const { assets, getAssetIcon } = GeneralHook();

  return (
    <Fragment>
      <div className="reative flex flex-col justify-start items-start w-full gap-4 text-md">
        <CloseIcon
          className="absolute top-5 right-5 cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setAddOpen(false);
          }}
        />
        <p>{t("add.contact")}</p>
        <div className="flex flex-row justify-start items-start w-full gap-3">
          <div className="flex flex-col justify-start items-start w-[50%]">
            <p>{t("name")}</p>
            <CustomInput
              sizeInput={"medium"}
              placeholder={""}
              border={newContactNameErr ? "error" : undefined}
              value={newContact.name}
              onChange={(e) => {
                onNameChange(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-col justify-start items-start w-full">
            <p>{"Principal"}</p>
            <CustomInput
              sizeInput={"medium"}
              placeholder={""}
              border={newContactPrinErr ? "error" : undefined}
              value={newContact.principal}
              onChange={(e) => {
                onPrincipalChange(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-row justify-center items-center w-full h-72 rounded-sm bg-ThirdColorLight dark:bg-ThirdColor gap-3">
          {newContact.assets.length === 0 ? (
            <ContactAssetPop
              assets={assets}
              getAssetIcon={getAssetIcon}
              onAdd={(data) => {
                assetToAddEmpty(data);
              }}
            />
          ) : (
            <AddAssetToContact
              newContact={newContact}
              setNewContact={setNewContact}
              selAstContact={selAstContact}
              isValidSubacc={isValidSubacc}
              isAvailableAddContact={isAvailableAddContact}
              newSubAccounts={newSubAccounts}
              setNewSubaccounts={setNewSubaccounts}
              newContactSubNameErr={newContactSubNameErr}
              setNewContactSubNameErr={setNewContactSubNameErr}
              newContactSubIdErr={newContactSubIdErr}
              setNewContactErr={setNewContactErr}
              setNewContactSubIdErr={setNewContactSubIdErr}
            />
          )}
        </div>
        <div className="flex flex-row justify-end items-center w-full gap-3">
          <p className="text-TextErrorColor">{t(newContactErr)}</p>
          <CustomButton className="min-w-[5rem]" onClick={onAddContact}>
            <p>{t("add.contact")}</p>
          </CustomButton>
        </div>
      </div>
    </Fragment>
  );

  function onNameChange(value: string) {
    setNewContact((prev) => {
      return { ...prev, name: value };
    });
    setNewContactErr("");
    setNewContactNameErr(false);
  }

  function onPrincipalChange(value: string) {
    setNewContact((prev) => {
      return { ...prev, principal: value };
    });
    setNewContactErr("");
    if (value.trim() !== "")
      try {
        Principal.fromText(value);
        setNewContactPrinErr(false);
      } catch {
        setNewContactPrinErr(true);
      }
    else setNewContactPrinErr(false);
  }

  function assetToAddEmpty(data: AssetToAdd[]) {
    let auxConatct: Contact = {
      name: "",
      principal: "",
      assets: [],
    };
    setNewContact((prev) => {
      auxConatct = {
        ...prev,
        assets: data.map((ata) => {
          return {
            symbol: ata.symbol,
            subaccounts: [],
            tokenSymbol: ata.tokenSymbol,
            logo: ata.logo,
          };
        }),
      };
      return auxConatct;
    });
    if (data[0]) {
      setSelAstContact(data[0].tokenSymbol);
      const auxAsset = auxConatct.assets.find((ast) => ast.tokenSymbol === data[0].tokenSymbol);
      if (auxAsset)
        setNewSubaccounts(
          auxAsset.subaccounts.length === 0 ? [{ name: "", subaccount_index: "" }] : auxAsset.subaccounts,
        );
    }
  }

  function onAddContact() {
    let validContact = true;
    let err = { msg: "", name: false, prin: false };
    if (newContact.name.trim() === "" && newContact.principal.trim() === "") {
      validContact = false;
      err = { msg: "check.add.contact.both.err", name: true, prin: true };
    } else {
      if (newContact.name.trim() === "") {
        validContact = false;
        err = { ...err, msg: "check.add.contact.name.err", name: true };
      }
      if (newContact.principal.trim() === "") {
        validContact = false;
        err = { ...err, msg: "check.add.contact.prin.empty.err", prin: true };
      } else if (!checkPrincipalValid(newContact.principal)) {
        validContact = false;
        err = { ...err, msg: "check.add.contact.prin.err", prin: true };
      }
    }
    setNewContactErr(err.msg);
    setNewContactNameErr(err.name);
    setNewContactPrinErr(err.prin);
    isValidSubacc("add", validContact, undefined, () => {
      setAddOpen(false);
    });
  }
};

export default AddContact;
