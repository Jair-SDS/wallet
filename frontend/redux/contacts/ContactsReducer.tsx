import { HplContact } from "@redux/models/AccountModels";
import { Contact } from "@redux/models/ContactsModels";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ContactsState {
  storageCode: string;
  contacts: Contact[];
  hplContacts: HplContact[];
}

const initialState: ContactsState = {
  storageCode: "",
  contacts: [],
  hplContacts: [],
};

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setStorageCode(state, action: PayloadAction<string>) {
      state.storageCode = action.payload;
    },
    setReduxContacts(state, action: PayloadAction<Contact[]>) {
      state.contacts = action.payload;
    },
    clearDataContacts(state) {
      state.contacts = [];
      state.hplContacts = [];
      state.storageCode = "";
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
        setLocalHplContacts(auxContacts, state.storageCode);
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
        setLocalHplContacts(auxContacts, state.storageCode);
      },
      prepare(principal: string, index: string) {
        return {
          payload: { principal, index },
        };
      },
    },
    setHplContacts(state, action: PayloadAction<HplContact[]>) {
      state.hplContacts = action.payload;
      setLocalHplContacts(action.payload, state.storageCode);
    },
  },
});

const setLocalHplContacts = (contacts: HplContact[], code: string) => {
  localStorage.setItem(
    "hpl-" + code,
    JSON.stringify({
      contacts: contacts,
    }),
  );
};

export const {
  setStorageCode,
  setReduxContacts,
  clearDataContacts,
  setHplContacts,
  removeHplContact,
  removeHplContactRemote,
} = contactsSlice.actions;

export default contactsSlice.reducer;
