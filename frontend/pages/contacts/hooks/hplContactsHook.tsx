import { DeleteContactTypeEnum } from "@common/const";
import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { removeHplContact, removeHplContactRemote, setHplContacts } from "@redux/contacts/ContactsReducer";
import { HplContact, HplRemote } from "@redux/models/AccountModels";
import { ContactErr } from "@redux/models/ContactsModels";
import { useState } from "react";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { formatHplRemotes } from "@common/utils/hpl";
import logger from "@/common/utils/logger";

export const useHplContacts = () => {
  // reducer

  const dispatch = useAppDispatch();
  const { contacts, hplContacts, storageCode } = useAppSelector((state) => state.contacts);
  const { ownersActor } = useAppSelector((state) => state.hpl);
  const { protocol } = useAppSelector((state) => state.common);

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

  const [checkIds, setCheckIds] = useState<string[]>([]);

  const checkPrincipalValid = (principal: string) => {
    try {
      Principal.fromText(principal);
      return true;
    } catch (error) {
      logger.debug("checkSubAccount: ", error);
      return false;
    }
  };
  const checkUsedPrincipal = (principal: string) => {
    return hplContacts.find((ctc) => ctc.principal === principal) ? false : true;
  };

  function onAddContact(edit: boolean, setAddOpen: (e: boolean) => void) {
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
      } else if (!checkPrincipalValid(newContact.principal) || (!checkUsedPrincipal(newContact.principal) && !edit)) {
        validContact = false;
        err = { ...err, msg: "check.add.contact.prin.err", prin: true };
      }
    }

    setNewContactErr(err.msg);
    setNewContactNameErr(err.name);
    setNewContactPrinErr(err.prin);

    if (validContact) {
      let auxConatct: HplContact[] = [];
      const selRemotes = chainRemotes.filter((rmt) => {
        return checkIds.includes(rmt.index);
      });
      if (edit) {
        hplContacts.map((cntc) => {
          if (cntc.principal === newContact.principal) auxConatct.push({ ...newContact, remotes: selRemotes });
          else auxConatct.push(cntc);
        });
      } else {
        auxConatct = [...hplContacts, { ...newContact, remotes: selRemotes }];
      }
      console.log("saveHplContacts", auxConatct);

      saveHplContacts(auxConatct);

      setAddOpen(false);
    }
  }

  async function fetchRemotes(edit: HplContact | undefined, ingressActor: ActorSubclass<IngressActor>) {
    if (edit) {
      const remotesInfo = await ingressActor.remoteAccountInfo({
        idRange: [Principal.fromText(edit.principal), BigInt(0), []],
      });
      const remoteState = (
        await ingressActor.state({
          ftSupplies: [],
          virtualAccounts: [],
          accounts: [],
          remoteAccounts: [{ idRange: [Principal.fromText(edit.principal), BigInt(0), []] }],
        })
      ).remoteAccounts;
      setNewContact(edit);

      const ownerID = await getOwnerId(edit.principal);

      const auxRemotes: HplRemote[] = [];
      const actorRemotes = formatHplRemotes(remotesInfo, remoteState, ownerID);

      const actorIds: string[] = [];
      actorRemotes.map((actorRemote) => {
        actorIds.push(actorRemote.index);
        const founded = edit.remotes.find((editRemote) => actorRemote.index === editRemote.index);
        founded &&
          setCheckIds((prev) => {
            return [...prev, founded.index];
          });
        auxRemotes.push(founded ? { ...actorRemote, name: founded.name } : actorRemote);
      });
      edit.remotes.map((editRemote) => {
        if (!actorIds.includes(editRemote.index)) {
          auxRemotes.push({ ...editRemote, status: "deleted" });
        }
      });
      setChainremotes(
        auxRemotes.sort((a, b) => {
          return Number(a.index) - Number(b.index);
        }),
      );
    }
  }
  async function searchRemotes(
    edit: HplContact | undefined,
    ingressActor: ActorSubclass<IngressActor>,
    principal: string,
    fromQr: boolean,
  ) {
    if (edit) {
      await fetchRemotes(edit, ingressActor);
    } else {
      if (!fromQr) {
        if (principal.trim() === "") {
          setNewContactErr("check.add.contact.prin.empty.err");
          setNewContactPrinErr(true);
          return;
        } else if (!checkPrincipalValid(principal)) {
          setNewContactErr("check.add.contact.prin.err");
          setNewContactPrinErr(true);
          return;
        } else if (!checkUsedPrincipal(principal)) {
          setNewContactErr("used.contact.prin.err");
          setNewContactPrinErr(true);
          return;
        }
      }
      try {
        const remotesInfo = await ingressActor.remoteAccountInfo({
          idRange: [Principal.fromText(principal), BigInt(0), []],
        });
        const remoteState = (
          await ingressActor.state({
            ftSupplies: [],
            virtualAccounts: [],
            accounts: [],
            remoteAccounts: [{ idRange: [Principal.fromText(principal), BigInt(0), []] }],
          })
        ).remoteAccounts;
        if (remotesInfo.length === 0 || remoteState.length === 0) setNewContactErr("no.remotes.found");
        else {
          const ownerID = await getOwnerId(principal);
          setChainremotes(formatHplRemotes(remotesInfo, remoteState, ownerID));
        }
      } catch (error) {
        logger.debug(error);
        setNewContactErr("no.remotes.found");
      }
    }
  }

  const getOwnerId = async (principal: string) => {
    let myOwnerId = undefined;
    const ownerID = await ownersActor.lookup(Principal.fromText(principal));
    if (ownerID[0]) {
      myOwnerId = ownerID[0].toString();
    }
    return myOwnerId;
  };

  const removeHplCntct = (principal: string) => dispatch(removeHplContact(principal));
  const removeHplCntctRemote = (principal: string, index: string) => dispatch(removeHplContactRemote(principal, index));

  return {
    protocol,
    contacts,
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
    checkIds,
    setCheckIds,
    contactEditedErr,
    setContactEditedErr,
    checkPrincipalValid,
    checkUsedPrincipal,
    saveHplContacts,
    onAddContact,
    fetchRemotes,
    searchRemotes,
    removeHplCntct,
    removeHplCntctRemote,
  };
};
