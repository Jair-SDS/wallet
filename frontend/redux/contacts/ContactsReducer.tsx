import { db } from "@/database/db";
import { HplContact } from "@redux/models/AccountModels";
import { Contact } from "@redux/models/ContactsModels";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import logger from "@/common/utils/logger";

interface ContactsState {
  contacts: Contact[];
  hplContacts: HplContact[];
}

const initialState: ContactsState = {
  contacts: [],
  hplContacts: [],
};

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setReduxContacts(state, action: PayloadAction<Contact[]>) {
      state.contacts = action.payload;
    },
    addReduxContact(state, action: PayloadAction<Contact>) {
      state.contacts.push(action.payload);
    },
    updateReduxContact(state, action: PayloadAction<Contact>) {
      const index = state.contacts.findIndex((contact) => contact.principal === action.payload.principal);
      if (index !== -1) state.contacts[index] = action.payload;
      if (index === -1) logger.debug("Contact not found");
    },
    deleteReduxContact(state, action: PayloadAction<string>) {
      state.contacts = state.contacts.filter((contact) => contact.principal !== action.payload);
    },
    clearDataContacts(state) {
      state.contacts = [];
      state.hplContacts = [];
    },
    removeHplContact: {
      reducer(
        state,
        action: PayloadAction<{
          principal: string;
        }>,
      ) {
        const auxContacts = state.hplContacts.filter((cnts) => cnts.principal !== action.payload.principal);

        state.hplContacts = auxContacts;
        setLocalHplContacts(auxContacts);
      },
      prepare(principal: string) {
        return {
          payload: { principal },
        };
      },
    },
    removeHplContactRemote: {
      reducer(
        state,
        action: PayloadAction<{
          principal: string;
          index: string;
        }>,
      ) {
        const auxContacts = state.hplContacts.map((cnts) => {
          if (cnts.principal !== action.payload.principal) return cnts;
          else {
            return { ...cnts, remotes: cnts.remotes.filter((asst) => asst.index !== action.payload.index) };
          }
        });

        state.hplContacts = auxContacts;
        setLocalHplContacts(auxContacts);
      },
      prepare(principal: string, index: string) {
        return {
          payload: { principal, index },
        };
      },
    },
    setHplContacts(state, action: PayloadAction<HplContact[]>) {
      state.hplContacts = action.payload;
      setLocalHplContacts(action.payload);
    },
  },
});

const setLocalHplContacts = (contacts: HplContact[]) => {
  db().updateHplContactsByLedger(contacts);
};

export const {
  addReduxContact,
  updateReduxContact,
  deleteReduxContact,
  setReduxContacts,
  clearDataContacts,
  setHplContacts,
  removeHplContact,
  removeHplContactRemote,
} = contactsSlice.actions;

export default contactsSlice.reducer;
