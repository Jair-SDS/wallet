import { DeleteContactTypeEnum } from "@/const";
import { Principal } from "@dfinity/principal";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { setHplContacts } from "@redux/contacts/ContactsReducer";
import { HplContact, HplRemote } from "@redux/models/AccountModels";
import { ContactErr } from "@redux/models/ContactsModels";
import { useState } from "react";

export const useHplContacts = () => {
  // reducer

  const dispatch = useAppDispatch();
  const { hplContacts, storageCode } = useAppSelector((state) => state.contacts);
  const { protocol } = useAppSelector((state) => state.asset);

  const saveHplContacts = (contacts: HplContact[]) => {
    dispatch(setHplContacts(contacts));
  };

  // new contact
  const [newContact, setNewContact] = useState<HplContact>({
    name: "",
    principal: "",
    remotes: [],
  });
  const [selAstContact, setSelAstContact] = useState("");
  const [newContactErr, setNewContactErr] = useState("");
  const [newContactNameErr, setNewContactNameErr] = useState(false);
  const [newContactPrinErr, setNewContactPrinErr] = useState(false);

  // contact list
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteContactTypeEnum>(DeleteContactTypeEnum.Enum.ASSET);
  const [contactEdited, setContactEdited] = useState<HplContact>({
    name: "",
    principal: "",
    remotes: [],
  });
  const [contactEditedErr, setContactEditedErr] = useState<ContactErr>({
    name: false,
    principal: false,
  });

  const [chainRemotes, setChainremotes] = useState<HplRemote[]>([]);
  const [savedRemotes, setSavedRemotes] = useState<HplRemote[]>([]);

  const checkPrincipalValid = (principal: string) => {
    try {
      Principal.fromText(principal);
      return true;
    } catch {
      return false;
    }
  };
  const checkUsedPrincipal = (principal: string) => {
    return hplContacts.find((ctc) => ctc.principal === principal) ? false : true;
  };

  return {
    protocol,
    storageCode,
    hplContacts,
    newContact,
    setNewContact,
    selAstContact,
    chainRemotes,
    savedRemotes,
    setSavedRemotes,
    setChainremotes,
    setSelAstContact,
    newContactErr,
    setNewContactErr,
    newContactNameErr,
    setNewContactNameErr,
    newContactPrinErr,
    setNewContactPrinErr,
    contactEdited,
    setContactEdited,
    deleteModal,
    setDeleteModal,
    deleteType,
    setDeleteType,
    contactEditedErr,
    setContactEditedErr,
    checkPrincipalValid,
    checkUsedPrincipal,
    saveHplContacts,
  };
};
