import { getAccountIdentifier, hexToNumber } from "@/utils";
import { HplContact } from "@redux/models/AccountModels";
import { AssetContact, Contact } from "@redux/models/ContactsModels";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import bigInt from "big-integer";
import { db } from "@/database/db";
import store from "@redux/Store";

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
    addContact(_, action: PayloadAction<Contact>) {
      db()
        .addContact({ ...action.payload, accountIdentier: getAccountIdentifier(action.payload.principal, 0) })
        .then();
    },
    deleteContatc(_, action: PayloadAction<string>) {
      db().deleteContact(action.payload).then();
    },
    editContact: {
      reducer(
        _,
        action: PayloadAction<{
          editedContact: Contact;
          pastPrincipal: string;
        }>,
      ) {
        db().updateContact(action.payload.pastPrincipal, action.payload.editedContact).then();
      },
      prepare(editedContact: Contact, pastPrincipal: string) {
        return {
          payload: { editedContact, pastPrincipal },
        };
      },
    },
    addAssetToContact: {
      reducer(
        _,
        action: PayloadAction<{
          asset: AssetContact[];
          pastPrincipal: string;
        }>,
      ) {
        db()
          .getContact(action.payload.pastPrincipal)
          .then(async (cnt) => {
            if (cnt) {
              await db().updateContact(action.payload.pastPrincipal, {
                ...cnt,
                assets: [...cnt.assets, ...action.payload.asset],
              });
            }
          });
      },
      prepare(asset: AssetContact[], pastPrincipal: string) {
        return {
          payload: { asset, pastPrincipal },
        };
      },
    },
    editAssetName: {
      reducer(
        _,
        action: PayloadAction<{
          tokenSymbol: string;
          symbol: string;
        }>,
      ) {
        setTimeout(async () => {
          const affectedContacts: Contact[] = [];
          for (const cnt of await db().getContacts()) {
            let affected = false;
            const newDoc = {
              ...cnt,
              assets: cnt.assets.map((asst) => {
                if (asst.tokenSymbol === action.payload.tokenSymbol) {
                  affected = true;
                  return { ...asst, symbol: action.payload.symbol };
                } else return asst;
              }),
            };
            if (affected) {
              affectedContacts.push(newDoc);
            }
          }
          await Promise.all(affectedContacts.map((c) => db().updateContact(c.principal, c)));
        }, 0);
      },
      prepare(tokenSymbol: string, symbol: string) {
        return {
          payload: { tokenSymbol, symbol },
        };
      },
    },
    addContactSubacc: {
      reducer(
        _,
        action: PayloadAction<{
          principal: string;
          tokenSymbol: string;
          newName: string;
          newIndex: string;
          subAccountId: string;
          allowance?: { allowance: string; expires_at: string } | undefined;
        }>,
      ) {
        db()
          .getContact(action.payload.principal)
          .then(async (contact) => {
            if (contact) {
              await db().updateContact(action.payload.principal, {
                ...contact,
                assets: contact.assets.map((asset) => {
                  if (asset.tokenSymbol !== action.payload.tokenSymbol) {
                    return asset;
                  } else {
                    return {
                      ...asset,
                      subaccounts: [
                        ...asset.subaccounts,
                        {
                          name: action.payload.newName,
                          subaccount_index: action.payload.newIndex,
                          sub_account_id: action.payload.subAccountId,
                          allowance: action.payload.allowance,
                        },
                      ].sort(
                        (a, b) =>
                          hexToNumber(`0x${a.subaccount_index}`)?.compare(
                            hexToNumber(`0x${b.subaccount_index}`) || bigInt(0),
                          ) || 0,
                      ),
                    };
                  }
                }),
              });
            }
          });
      },
      prepare(
        principal: string,
        tokenSymbol: string,
        newName: string,
        newIndex: string,
        subAccountId: string,
        allowance?: { allowance: string; expires_at: string } | undefined,
      ) {
        return {
          payload: { principal, tokenSymbol, newName, newIndex, subAccountId, allowance },
        };
      },
    },
    editContactSubacc: {
      reducer(
        _,
        action: PayloadAction<{
          principal: string;
          tokenSymbol: string;
          subIndex: string;
          newName: string;
          newIndex: string;
          allowance: { allowance: string; expires_at: string } | undefined;
        }>,
      ) {
        db()
          .getContact(action.payload.principal)
          .then(async (contact) => {
            if (contact) {
              await db().updateContact(action.payload.principal, {
                ...contact,
                assets: contact.assets.map((asset) => {
                  if (asset.tokenSymbol !== action.payload.tokenSymbol) {
                    return asset;
                  } else {
                    return {
                      ...asset,
                      subaccounts: asset.subaccounts
                        .map((subAccount) => {
                          if (subAccount.subaccount_index !== action.payload.subIndex) return subAccount;
                          else {
                            return {
                              name: action.payload.newName,
                              subaccount_index: action.payload.newIndex,
                              sub_account_id: `0x${action.payload.newIndex}`,
                              allowance: action.payload.allowance,
                            };
                          }
                        })
                        .sort(
                          (a, b) =>
                            hexToNumber(`0x${a.subaccount_index}`)?.compare(
                              hexToNumber(`0x${b.subaccount_index}`) || bigInt(0),
                            ) || 0,
                        ),
                    };
                  }
                }),
              });
            }
          });
      },
      prepare(
        principal: string,
        tokenSymbol: string,
        subIndex: string,
        newName: string,
        newIndex: string,
        allowance: { allowance: string; expires_at: string } | undefined,
      ) {
        return {
          payload: { principal, tokenSymbol, subIndex, newName, newIndex, allowance },
        };
      },
    },
    removeContact: {
      reducer(
        _,
        action: PayloadAction<{
          principal: string;
        }>,
      ) {
        db().deleteContact(action.payload.principal).then();
      },
      prepare(principal: string) {
        return {
          payload: { principal },
        };
      },
    },
    removeContactAsset: {
      reducer(
        _,
        action: PayloadAction<{
          principal: string;
          tokenSymbol: string;
        }>,
      ) {
        db()
          .getContact(action.payload.principal)
          .then(async (cnt) => {
            if (cnt) {
              await db().updateContact(action.payload.principal, {
                ...cnt,
                assets: cnt.assets.filter((asst) => asst.tokenSymbol !== action.payload.tokenSymbol),
              });
            }
          });
      },
      prepare(principal: string, tokenSymbol: string) {
        return {
          payload: { principal, tokenSymbol },
        };
      },
    },
    removeContactSubacc: {
      reducer(
        _,
        action: PayloadAction<{
          principal: string;
          tokenSymbol: string;
          subIndex: string;
        }>,
      ) {
        db()
          .getContact(action.payload.principal)
          .then(async (contact) => {
            if (contact) {
              await db().updateContact(action.payload.principal, {
                ...contact,
                assets: contact.assets.map((asset) => {
                  if (asset.tokenSymbol !== action.payload.tokenSymbol) {
                    return asset;
                  } else {
                    return {
                      ...asset,
                      subaccounts: asset.subaccounts.filter(
                        (subAccount) => subAccount.subaccount_index !== action.payload.subIndex,
                      ),
                    };
                  }
                }),
              });
            }
          });
      },
      prepare(principal: string, tokenSymbol: string, subIndex: string) {
        return {
          payload: { principal, tokenSymbol, subIndex },
        };
      },
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
    clearDataContacts(state) {
      state.contacts = [];
      state.hplContacts = [];
      state.storageCode = "";
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

db()
  .subscribeToAllContacts()
  .subscribe((x) => store.dispatch(contactsSlice.actions.setReduxContacts(x)));

export const {
  setStorageCode,
  setReduxContacts,
  clearDataContacts,
  addContact,
  deleteContatc,
  editContact,
  addAssetToContact,
  editAssetName,
  addContactSubacc,
  editContactSubacc,
  removeContact,
  removeContactAsset,
  removeContactSubacc,
  setHplContacts,
  removeHplContact,
  removeHplContactRemote,
} = contactsSlice.actions;

export default contactsSlice.reducer;
