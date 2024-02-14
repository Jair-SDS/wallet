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
import { setAssetFromLocalData, updateAllBalances, updateHPLBalances } from "./assets/AssetActions";
import {
  clearDataAsset,
  setFeeConstant,
  setHPLAssetsData,
  setHPLClient,
  setHPLDictionary,
  setHPLSubsData,
  setHPLVTsData,
  setIngressActor,
  setOwnersActor,
  setStorageCodeA,
  setTokens,
  setLoading,
} from "./assets/AssetReducer";
import { AuthNetwork } from "./models/TokenModels";
import { AuthNetworkTypeEnum, RoutingPathEnum } from "@/const";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { clearDataContacts, setContacts, setStorageCode } from "./contacts/ContactsReducer";
import { HPLClient } from "@research-ag/hpl-client";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { idlFactory as IngressIDLFactory } from "@candid/HPL/candid.did";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { idlFactory as OwnersIDLFactory } from "@candid/Owners/candid.did";
import { HPLAssetData, HplContact } from "./models/AccountModels";
import { parseFungibleToken } from "@/utils";
import { Principal } from "@dfinity/principal";
import { defaultTokens } from "@/defaultTokens";
import { allowanceCacheRefresh } from "@pages/home/helpers/allowanceCache";
import contactCacheRefresh from "@pages/contacts/helpers/contacts";
import { setAllowances } from "./allowance/AllowanceReducer";

const AUTH_PATH = `/authenticate/?applicationName=${import.meta.env.VITE_APP_NAME}&applicationLogo=${
  import.meta.env.VITE_APP_LOGO
}#authorize`;

export const handleAuthenticated = async (opt: AuthNetwork) => {
  const authClient = await AuthClient.create();
  await new Promise<void>((resolve, reject) => {
    authClient.login({
      maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000),
      identityProvider:
        !!opt?.type && opt?.type === AuthNetworkTypeEnum.Values.NFID
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
    handleLoginApp(newIdentity, true);
  }
};

export const handlePrincipalAuthenticated = async (principalAddress: string) => {
  try {
    const authClient = await AuthClient.create();
    const principal = Principal.fromText(principalAddress);
    handleLoginApp(authClient.getIdentity(), false, principal);
  } catch {
    return;
  }
};

export const handleLoginApp = async (authIdentity: Identity, fromSeed?: boolean, fixedPrincipal?: Principal) => {
  store.dispatch(setLoading(true));
  if (localStorage.getItem("network_type") === null && !fromSeed && !fixedPrincipal) {
    logout();
    return;
  }
  store.dispatch(setAuthLoading(true));
  const myAgent = new HttpAgent({
    identity: authIdentity,
    host: "https://identity.ic0.app",
  });

  const myPrincipal = fixedPrincipal || (await myAgent.getPrincipal());
  const identityPrincipalStr = fixedPrincipal?.toString() || authIdentity.getPrincipal().toString();

  // HPL ACTOR
  const hplLedPrin = localStorage.getItem("hpl-led-pric-" + identityPrincipalStr) || "rqx66-eyaaa-aaaap-aaona-cai";
  if (hplLedPrin !== "rqx66-eyaaa-aaaap-aaona-cai") {
    localStorage.setItem("hpl-led-pric-" + identityPrincipalStr, hplLedPrin);
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

  // ICRC-1 TOKENS
  const userData = localStorage.getItem(identityPrincipalStr);
  if (userData) {
    const userDataJson = JSON.parse(userData);
    store.dispatch(setTokens(userDataJson.tokens));
    setAssetFromLocalData(userDataJson.tokens, myPrincipal.toText());
    // AUTH
    dispatchAuths(identityPrincipalStr.toLocaleLowerCase(), myAgent, myPrincipal, !!fixedPrincipal);
    updateAllBalances(myAgent, userDataJson.tokens, false, true);
  } else {
    store.dispatch(setUserPrincipal(myPrincipal));
    const { tokens } = await updateAllBalances(myAgent, defaultTokens, true, true);
    // AUTH
    dispatchAuths(identityPrincipalStr.toLocaleLowerCase(), myAgent, myPrincipal, !!fixedPrincipal);
    store.dispatch(setTokens(tokens));
  }
  // ICRC-1 CONTACTS
  const contactsData = localStorage.getItem("contacts-" + identityPrincipalStr);
  if (contactsData) {
    const contactsDataJson = JSON.parse(contactsData);
    store.dispatch(setContacts(contactsDataJson.contacts));
  }

  if (!fixedPrincipal) {
    // HPL FT
    const hplFTsData = localStorage.getItem("hplFT-" + identityPrincipalStr);
    if (hplFTsData != null) {
      const hplFTsDataJson = JSON.parse(hplFTsData).ft as HPLAssetData[];
      store.dispatch(setHPLAssetsData(hplFTsDataJson));
    }
    // HPL DICTIONARY
    const hplDictPrin = localStorage.getItem("hpl-dict-pric-" + identityPrincipalStr);

    store.dispatch(setHplDictionaryPrincipal(hplDictPrin || ""));
    if (hplDictPrin) {
      try {
        const dictActor = Actor.createActor<DictionaryActor>(DictionaryIDLFactory, {
          agent: myAgent,
          canisterId: hplDictPrin,
        });
        const dictFTs = await dictActor.getDump();
        store.dispatch(setHPLDictionary(parseFungibleToken(dictFTs)));
      } catch (e) {
        console.log("dictFTs-err:", e);
        localStorage.removeItem("hpl-dict-pric-" + identityPrincipalStr);
      }
    }
    // HPL SUBACCOUNTS
    const hplSubsData = localStorage.getItem("hplSUB-" + identityPrincipalStr);
    if (hplSubsData != null) {
      const hplSubsDataJson = JSON.parse(hplSubsData);
      store.dispatch(setHPLSubsData(hplSubsDataJson.sub));
    }
    // HPL VIRTUALS
    const hplVTsData = localStorage.getItem("hplVT-" + identityPrincipalStr);
    if (hplVTsData != null) {
      const hplVTsDataJson = JSON.parse(hplVTsData);
      store.dispatch(setHPLVTsData(hplVTsDataJson.vt));
    }
    // HPL CONTACTS
    let hplContactsDataJson: { contacts: HplContact[] } = { contacts: [] };
    const hplContactsData = localStorage.getItem("hpl-contacts-" + identityPrincipalStr);
    if (hplContactsData != null) {
      try {
        hplContactsDataJson = JSON.parse(hplContactsData);
      } catch {
        //
      }
    }
    // HPL OWNERS
    const ownerActor = Actor.createActor<OwnersActor>(OwnersIDLFactory, {
      agent: myAgent,
      canisterId: "n65ik-oqaaa-aaaag-acb4q-cai",
    });
    store.dispatch(setOwnersActor(ownerActor));

    // HPL TOKENS
    const forceUpdate = hplFTsData === null || hplSubsData === null || hplVTsData === null;
    await updateHPLBalances(
      ingressActor,
      ownerActor,
      hplContactsDataJson.contacts,
      identityPrincipalStr,
      false,
      forceUpdate,
    );
    try {
      const feeConstant = await ingressActor.feeRatio();
      store.dispatch(setFeeConstant(Number(feeConstant.toString())));
    } catch (e) {
      console.log("feeConstant-err", e);
    }
  }

  // ALLOWANCES
  await contactCacheRefresh(myPrincipal.toText());
  await allowanceCacheRefresh(myPrincipal.toText());
  store.dispatch(setLoading(false));
};

export const dispatchAuths = (
  identityPrincipal: string,
  myAgent: HttpAgent,
  myPrincipal: Principal,
  watchOnlyMode: boolean,
) => {
  store.dispatch(setAuthenticated(true, false, watchOnlyMode, identityPrincipal));
  store.dispatch(setStorageCode("contacts-" + identityPrincipal));
  store.dispatch(setStorageCodeA("contacts-" + identityPrincipal));
  store.dispatch(setUserAgent(myAgent));
  store.dispatch(setUserPrincipal(myPrincipal));
  store.dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
};

export const logout = async () => {
  store.dispatch(clearDataContacts());
  store.dispatch(clearDataAsset());
  store.dispatch(clearDataAuth());
  store.dispatch(setAllowances([]));
  store.dispatch(setUnauthenticated());
  store.dispatch(setUserAgent(undefined));
  store.dispatch(setUserPrincipal(undefined));
  const authClient = await AuthClient.create();
  await authClient.logout();
  store.dispatch({
    type: "USER_LOGGED_OUT",
  });
};
