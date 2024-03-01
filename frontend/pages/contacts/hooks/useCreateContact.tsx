import { db } from "@/database/db";
import { getAccountIdentifier, removeLeadingZeros } from "@/utils";
import { validateSubaccounts } from "@/utils/checkers";
import { retrieveAssetsWithAllowance } from "@pages/home/helpers/icrc";
import { AssetContact, Contact, SubAccountContact } from "@redux/models/ContactsModels";

import { useState } from "react";

export const useCreateContact = () => {
  const [newContact, setNewContact] = useState<Contact>({
    name: "",
    principal: "",
    assets: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selAstContact, setSelAstContact] = useState("");
  const [newSubAccounts, setNewSubaccounts] = useState<SubAccountContact[]>([]);

  const [newContactErr, setNewContactErr] = useState("");
  const [newContactNameErr, setNewContactNameErr] = useState(false);
  const [newContactPrinErr, setNewContactPrinErr] = useState(false);
  const [newContactSubNameErr, setNewContactSubNameErr] = useState<number[]>([]);
  const [newContactSubIdErr, setNewContactSubIdErr] = useState<number[]>([]);

  async function isValidSubacc(from: string, validContact: boolean, contAst?: AssetContact, onclose?: () => void) {
    const { auxNewSub, errName, errId, validSubaccounts } = validateSubaccounts(newSubAccounts);
    // Check if valid Subaccounts and Valid prev contact info
    if (validSubaccounts && validContact) {
      const auxContact = { ...newContact };
      let editKey = 0;
      // Setting subaccount to the selected asset
      for (let index = 0; index < auxContact.assets.length; index++) {
        if (auxContact.assets[index].tokenSymbol === selAstContact) {
          editKey = index;
          break;
        }
      }

      if (auxContact.assets.length > 0) auxContact.assets[editKey].subaccounts = auxNewSub;
      if (from === "change" && contAst) {
        // INFO: change asset tab
        setNewContact(auxContact);
        setSelAstContact(contAst.tokenSymbol);
        setNewSubaccounts(
          contAst.subaccounts.length === 0
            ? [{ name: "", subaccount_index: "", sub_account_id: "" }]
            : contAst.subaccounts,
        );
      } else {
        // INFO: create contact into redux and local storage
        setIsCreating(true);
        const result = await retrieveAssetsWithAllowance({
          accountPrincipal: newContact.principal,
          assets: newContact.assets,
        });

        const toStoreContact = {
          ...auxContact,
          assets: result,
          accountIdentier: getAccountIdentifier(auxContact.principal, 0),
        };
        await db().addContact(toStoreContact);
        setIsCreating(false);
        onclose && onclose();
      }
      setNewContactSubNameErr([]);
      setNewContactSubIdErr([]);
      setNewContactErr("");
    } else {
      // Set errors and error message
      setNewContactSubNameErr(errName);
      setNewContactSubIdErr(errId);
      if (errName.length > 0 || errId.length > 0) setNewContactErr("check.add.contact.subacc.err");
    }
    return { validSubaccounts, auxNewSub, errName, errId };
  }

  function isAvailableAddContact() {
    let isAvailable = true;
    const ids: string[] = [];

    for (let index = 0; index < newSubAccounts.length; index++) {
      const newSa = newSubAccounts[index];
      let subAccIdx = "";
      if (removeLeadingZeros(newSa.subaccount_index.trim()) === "") {
        if (newSa.subaccount_index.length !== 0) subAccIdx = "0";
      } else subAccIdx = removeLeadingZeros(newSa.subaccount_index.trim());

      if (newSa.name.trim() === "") {
        isAvailable = false;
        break;
      }

      if (subAccIdx === "" || ids.includes(subAccIdx)) {
        isAvailable = false;
        break;
      } else {
        ids.push(subAccIdx);
      }
    }
    return isAvailable;
  }

  return {
    isCreating,
    setIsCreating,
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
    isValidSubacc,
    isAvailableAddContact,
  };
};
