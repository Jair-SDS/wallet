import { removeLeadingZeros } from "@/utils";
import { useAppDispatch } from "@redux/Store";
import { addContact } from "@redux/contacts/ContactsReducer";
import { AssetContact, Contact, SubAccountContact } from "@redux/models/ContactsModels";

import { useState } from "react";

export const useCreateContact = () => {
  const dispatch = useAppDispatch();
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

  function isValidSubacc(from: string, validContact: boolean, contAst?: AssetContact, onclose?: () => void) {
    const auxNewSub: SubAccountContact[] = [];
    const errName: number[] = [];
    const errId: number[] = [];
    let validSubaccounts = true;
    const ids: string[] = [];
    newSubAccounts.map((newSa, j) => {
      let subacc = newSa.subaccount_index.trim();
      // Check if string contains prefix "0x" and remove it if is the case
      if (subacc.slice(0, 2).toLowerCase() === "0x") subacc = subacc.substring(2);
      // Check if subaccount have data
      if (newSa.name.trim() !== "" || newSa.subaccount_index.trim() !== "") {
        // Removing zeros and check if subaccount index is not empty
        if (removeLeadingZeros(subacc) === "") {
          if (newSa.subaccount_index.length !== 0) subacc = "0";
        } else subacc = removeLeadingZeros(subacc);
        let valid = true;
        // Pushing position index of subaccounts that contains errors in the name (empty)
        if (newSa.name.trim() === "") {
          errName.push(j);
          valid = false;
          validSubaccounts = false;
        }
        // Pushing position index of sub
        if (subacc === "" || newSa.subaccount_index.trim().toLowerCase() === "0x" || ids.includes(subacc)) {
          errId.push(j);
          valid = false;
          validSubaccounts = false;
        } else {
          ids.push(subacc);
        }
        // Adding SubAccountContact to the new contact
        if (valid)
          auxNewSub.push({
            name: newSa.name.trim(),
            subaccount_index: subacc,
            sub_account_id: `0x${subacc}`,
          });
      }
    });
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
      // Verify if is an asset change or Add Contact action
      if (from === "change" && contAst) {
        setNewContact(auxContact);
        setSelAstContact(contAst.tokenSymbol);
        setNewSubaccounts(
          contAst.subaccounts.length === 0
            ? [{ name: "", subaccount_index: "", sub_account_id: "" }]
            : contAst.subaccounts,
        );
      } else {
        dispatch(addContact(auxContact));
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
