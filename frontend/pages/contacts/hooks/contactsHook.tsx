import { DeleteContactTypeEnum } from "@/const";
import { hexToNumber, removeLeadingZeros } from "@/utils";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import {
  addAssetToContact,
  addContact,
  addContactSubacc,
  editContact,
  editContactSubacc,
  removeContact,
  removeContactAsset,
  removeContactSubacc,
  removeHplContact,
  removeHplContactRemote,
} from "@redux/contacts/ContactsReducer";
import {
  AssetContact,
  Contact,
  ContactErr,
  NewContactSubAccount,
  SubAccountContact,
  SubAccountContactErr,
} from "@redux/models/ContactsModels";
import bigInt from "big-integer";
import { useEffect, useState } from "react";

export const useContacts = () => {
  const dispatch = useAppDispatch();

  // reducer
  const { contacts, hplContacts } = useAppSelector((state) => state.contacts);
  const { protocol } = useAppSelector((state) => state.asset);
  const updateContact = (editedContact: Contact, pastPrincipal: string) =>
    dispatch(editContact(editedContact, pastPrincipal));
  const addAsset = (asset: AssetContact[], pastPrincipal: string) => dispatch(addAssetToContact(asset, pastPrincipal));
  const removeCntct = (principal: string) => dispatch(removeContact(principal));
  const removeAsset = (principal: string, tokenSymbol: string) => dispatch(removeContactAsset(principal, tokenSymbol));
  const removeSubacc = (principal: string, tokenSymbol: string, subIndex: string) =>
    dispatch(removeContactSubacc(principal, tokenSymbol, subIndex));
  const editCntctSubacc = (
    principal: string,
    tokenSymbol: string,
    subIndex: string,
    newName: string,
    newIndex: string,
  ) => dispatch(editContactSubacc(principal, tokenSymbol, subIndex, newName, newIndex));
  const addCntctSubacc = (principal: string, tokenSymbol: string, newName: string, newIndex: string) =>
    dispatch(addContactSubacc(principal, tokenSymbol, newName, newIndex));

  const removeHplCntct = (principal: string) => dispatch(removeHplContact(principal));
  const removeHplCntctRemote = (principal: string, index: string) => dispatch(removeHplContactRemote(principal, index));
  // filter
  const [assetOpen, setAssetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [assetFilter, setAssetFilter] = useState<string[]>([]);

  // new contact
  const [newContact, setNewContact] = useState<Contact>({
    name: "",
    principal: "",
    assets: [],
  });
  const [selAstContact, setSelAstContact] = useState("");
  const [newSubAccounts, setNewSubaccounts] = useState<SubAccountContact[]>([]);
  const [newContactErr, setNewContactErr] = useState("");
  const [newContactNameErr, setNewContactNameErr] = useState(false);
  const [newContactPrinErr, setNewContactPrinErr] = useState(false);
  const [newContactSubNameErr, setNewContactSubNameErr] = useState<number[]>([]);
  const [newContactSubIdErr, setNewContactSubIdErr] = useState<number[]>([]);
  const [newContactShowErr, setNewContactShowErr] = useState(false);

  // contact list
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteHpl, setDeleteHpl] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteContactTypeEnum>(DeleteContactTypeEnum.Enum.ASSET);
  const [selCntcPrinAddAsst, setSelCntcPrinAddAsst] = useState("");
  const [selContactPrin, setSelContactPrin] = useState("");
  const [openAssetsPrin, setOpenAssetsPrin] = useState("");
  const [openSubaccToken, setOpenSubaccToken] = useState("");
  const [selSubaccIdx, setSelSubaccIdx] = useState("");
  const [contactEdited, setContactEdited] = useState<Contact>({
    name: "",
    principal: "",
    assets: [],
  });
  const [addSub, setAddSub] = useState(false);
  const [contactEditedErr, setContactEditedErr] = useState<ContactErr>({
    name: false,
    principal: false,
  });
  const [subaccEdited, setSubaccEdited] = useState<SubAccountContact>({
    name: "",
    subaccount_index: "",
  });
  const [subaccEditedErr, setSubaccEditedErr] = useState<SubAccountContactErr>({
    name: false,
    subaccount_index: false,
  });

  const [deleteObject, setDeleteObject] = useState<NewContactSubAccount>({
    principal: "",
    name: "",
    tokenSymbol: "",
    symbol: "",
    subaccIdx: "",
    subaccName: "",
    totalAssets: 0,
    TotalSub: 0,
  });

  const checkPrincipalValid = (principal: string) => {
    if (principal.trim() === "") return false;
    try {
      decodeIcrcAccount(principal);
    } catch {
      return false;
    }
    return contacts.find((ctc) => ctc.principal === principal) ? false : true;
  };
  const checkSubIndxValid = (idx: string, subs: SubAccountContact[]) => {
    if (idx.trim() === "") return false;
    return subs.find((sa) => hexToNumber(`0x${sa.subaccount_index}`)?.eq(hexToNumber(`0x${idx}`) || bigInt()))
      ? false
      : true;
  };

  function isValidSubacc(from: string, validContact: boolean, contAst?: AssetContact) {
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
        if (valid) auxNewSub.push({ name: newSa.name.trim(), subaccount_index: subacc });
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
          contAst.subaccounts.length === 0 ? [{ name: "", subaccount_index: "" }] : contAst.subaccounts,
        );
      } else {
        dispatch(addContact(auxContact));
        setAddOpen(false);
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

  useEffect(() => {
    setAssetFilter([]);
  }, [protocol]);

  return {
    protocol,
    contacts,
    hplContacts,
    assetOpen,
    setAssetOpen,
    searchKey,
    setSearchKey,
    assetFilter,
    setAssetFilter,
    addOpen,
    setAddOpen,
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
    selCntcPrinAddAsst,
    setSelCntcPrinAddAsst,
    selContactPrin,
    setSelContactPrin,
    contactEdited,
    setContactEdited,
    openAssetsPrin,
    setOpenAssetsPrin,
    openSubaccToken,
    setOpenSubaccToken,
    updateContact,
    selSubaccIdx,
    setSelSubaccIdx,
    subaccEdited,
    setSubaccEdited,
    addAsset,
    deleteModal,
    setDeleteModal,
    deleteType,
    setDeleteType,
    deleteObject,
    setDeleteObject,
    editCntctSubacc,
    addCntctSubacc,
    removeCntct,
    removeAsset,
    removeSubacc,
    contactEditedErr,
    setContactEditedErr,
    subaccEditedErr,
    setSubaccEditedErr,
    checkPrincipalValid,
    checkSubIndxValid,
    addSub,
    setAddSub,
    newContactShowErr,
    setNewContactShowErr,
    deleteHpl,
    setDeleteHpl,
    removeHplCntct,
    removeHplCntctRemote,
    isValidSubacc,
    isAvailableAddContact,
  };
};
