/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import store from "./Store";
import {
  clearDataAuth,
  setAuthLoading,
  setAuthenticated,
  setDebugMode,
  setHplDictionaryPrincipal,
  setHplLedgerPrincipal,
  setRoutingPath,
  setUnauthenticated,
  setUserAgent,
  setUserPrincipal,
} from "./auth/AuthReducer";
import { AuthClient } from "@dfinity/auth-client";
import { updateAllBalances, updateHPLBalances } from "./assets/AssetActions";
import {
  clearDataAsset,
  setHPLAssetsData,
  setHPLClient,
  setHPLDictionary,
  setHPLSubsData,
  setHPLVTsData,
  setIngressActor,
  setTokens,
} from "./assets/AssetReducer";
import { AuthNetwork } from "./models/TokenModels";
import { AuthNetworkTypeEnum, RoutingPathEnum, defaultTokens } from "@/const";
import { clearDataContacts, setContacts, setHplContacts, setStorageCode } from "./contacts/ContactsReducer";
import { HPLClient } from "@research-ag/hpl-client";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { idlFactory as IngressIDLFactory } from "@candid/HPL/candid.did";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { HPLAssetData } from "./models/AccountModels";

const AUTH_PATH = `/authenticate/?applicationName=${import.meta.env.VITE_APP_NAME}&applicationLogo=${
  import.meta.env.VITE_APP_LOGO
}#authorize`;

export const handleAuthenticated = async (opt: AuthNetwork) => {
  const authClient = await AuthClient.create();
  await new Promise<void>((resolve, reject) => {
    authClient.login({
      maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000),
      identityProvider:
        opt?.type === AuthNetworkTypeEnum.Values.NFID && opt?.type !== undefined && opt?.type !== null
          ? opt?.network + AUTH_PATH
          : "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        handleLoginApp(authClient.getIdentity());
        store.dispatch(setDebugMode(false));
        resolve();
      },
      onError: (e) => {
        console.error("onError", e);
        store.dispatch(setUnauthenticated());
        store.dispatch(setDebugMode(false));
        reject();
      },
    });
  });
};

export const handleSeedAuthenticated = (seed: string) => {
  const seedToIdentity: (seed: string) => Identity | null = (seed) => {
    const seedBuf = new Uint8Array(new ArrayBuffer(32));
    if (seed.length && seed.length > 0 && seed.length <= 32) {
      seedBuf.set(new TextEncoder().encode(seed));
      return Ed25519KeyIdentity.generate(seedBuf);
    }
    return null;
  };
  const newIdentity = seedToIdentity(seed);
  if (newIdentity) {
    store.dispatch(setDebugMode(true));
    handleLoginApp(newIdentity);
  }
};

export const handleLoginApp = async (authIdentity: Identity) => {
  if (localStorage.getItem("network_type") === null) logout();
  store.dispatch(setAuthLoading(true));
  const myAgent = new HttpAgent({
    identity: authIdentity,
    host: "https://identity.ic0.app",
  });

  const myPrincipal = await myAgent.getPrincipal();

  // HPL ACTOR
  const hplLedPrin =
    localStorage.getItem("hpl-led-pric-" + authIdentity.getPrincipal().toString()) || "rqx66-eyaaa-aaaap-aaona-cai";
  if (hplLedPrin !== "rqx66-eyaaa-aaaap-aaona-cai") {
    localStorage.setItem("hpl-led-pric-" + authIdentity.getPrincipal().toString(), hplLedPrin);
  }
  store.dispatch(setHplLedgerPrincipal(hplLedPrin));

  const ingressActor = Actor.createActor<IngressActor>(IngressIDLFactory, {
    agent: myAgent,
    canisterId: hplLedPrin,
  });
  store.dispatch(setIngressActor(ingressActor));
  const client = new HPLClient(hplLedPrin, "ic");
  await client.setIdentity(authIdentity as any);
  store.dispatch(setHPLClient(client));

  // HPL FT
  const hplFTsData = localStorage.getItem("hplFT-" + authIdentity.getPrincipal().toString());
  if (hplFTsData != null) {
    const hplFTsDataJson = JSON.parse(hplFTsData).ft as HPLAssetData[];
    store.dispatch(setHPLAssetsData(hplFTsDataJson));
  }

  // HPL DICTIONARY
  const hplDictPrin = localStorage.getItem("hpl-dict-pric-" + authIdentity.getPrincipal().toString());
  store.dispatch(setHplDictionaryPrincipal(hplDictPrin || ""));
  if (hplDictPrin) {
    try {
      const dictActor = Actor.createActor<DictionaryActor>(DictionaryIDLFactory, {
        agent: myAgent,
        canisterId: hplLedPrin,
      });
      const dictFTs = await dictActor.getDump();
      store.dispatch(setHPLDictionary(dictFTs));
    } catch {
      localStorage.removeItem("hpl-dict-pric-" + authIdentity.getPrincipal().toString());
    }
  }

  // HPL SUBACCOUNTS
  const hplSubsData = localStorage.getItem("hplSUB-" + authIdentity.getPrincipal().toString());
  if (hplSubsData != null) {
    const hplSubsDataJson = JSON.parse(hplSubsData);
    store.dispatch(setHPLSubsData(hplSubsDataJson.sub));
  }
  // HPL VIRTUALS
  const hplVTsData = localStorage.getItem("hplVT-" + authIdentity.getPrincipal().toString());
  if (hplVTsData != null) {
    const hplVTsDataJson = JSON.parse(hplVTsData);
    store.dispatch(setHPLVTsData(hplVTsDataJson.vt));
  }
  // HPL CONTACTS
  const hplContactsData = localStorage.getItem("hpl-contacts-" + authIdentity.getPrincipal().toString());
  if (hplContactsData != null) {
    const hplContactsDataJson = JSON.parse(hplContactsData);
    store.dispatch(setHplContacts(hplContactsDataJson.contacts));
  }

  // HPL TOKENS
  await updateHPLBalances(ingressActor);

  // AUTH
  store.dispatch(setStorageCode("contacts-" + authIdentity.getPrincipal().toText().toLowerCase()));
  store.dispatch(setUserAgent(myAgent));
  store.dispatch(setUserPrincipal(myPrincipal));
  store.dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
  store.dispatch(setAuthenticated(true, false, authIdentity.getPrincipal().toText().toLowerCase()));

  // ICRC-1 TOKENS
  const userData = localStorage.getItem(authIdentity.getPrincipal().toString());
  if (userData) {
    const userDataJson = JSON.parse(userData);
    store.dispatch(setTokens(userDataJson.tokens));
    await updateAllBalances(true, myAgent, userDataJson.tokens);
  } else {
    const { tokens } = await updateAllBalances(true, myAgent, defaultTokens, true);
    store.dispatch(setTokens(tokens));
  }
  // ICRC-1 CONTACTS
  const contactsData = localStorage.getItem("contacts-" + authIdentity.getPrincipal().toString());
  if (contactsData) {
    const contactsDataJson = JSON.parse(contactsData);
    store.dispatch(setContacts(contactsDataJson.contacts));
  }
};

export const logout = async () => {
  const authClient = await AuthClient.create();
  await authClient.logout();
  store.dispatch({
    type: "USER_LOGGED_OUT",
  });
  store.dispatch(clearDataContacts());
  store.dispatch(clearDataAsset());
  store.dispatch(clearDataAuth());
  store.dispatch(setUnauthenticated());
  store.dispatch(setUserAgent(undefined));
  store.dispatch(setUserPrincipal(undefined));
};
