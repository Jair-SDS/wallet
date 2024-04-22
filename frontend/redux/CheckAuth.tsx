/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Actor, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";
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
import { updateHPLBalances, getSNSTokens } from "./assets/AssetActions";
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
  setInitLoad,
  setICRC1SystemAssets,
  setMintActor,
} from "./assets/AssetReducer";
import { AuthNetwork } from "./models/TokenModels";
import { AuthNetworkTypeEnum, RoutingPathEnum } from "@/const";
import { Ed25519KeyIdentity, DelegationIdentity } from "@dfinity/identity";
import { clearDataContacts, setStorageCode } from "./contacts/ContactsReducer";
import { HPLClient } from "@research-ag/hpl-client";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { idlFactory as IngressIDLFactory } from "@candid/HPL/candid.did";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { idlFactory as OwnersIDLFactory } from "@candid/Owners/candid.did";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { idlFactory as HplMintIDLFactory } from "@candid/HplMint/candid.did";
import { HPLAssetData, HplContact } from "./models/AccountModels";
import { parseFungibleToken } from "@/utils";
import { Principal } from "@dfinity/principal";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { DB_Type, db } from "@/database/db";
import { setTransactions } from "./transaction/TransactionReducer";

const AUTH_PATH = `/authenticate/?applicationName=${import.meta.env.VITE_APP_NAME}&applicationLogo=${
  import.meta.env.VITE_APP_LOGO
}#authorize`;

const NETWORK_AUTHORIZE_PATH = "https://identity.ic0.app/#authorize";
const HTTP_AGENT_HOST = "https://identity.ic0.app";

export const handleAuthenticated = async (opt: AuthNetwork) => {
  const authClient = await AuthClient.create();
  await new Promise<void>((resolve, reject) => {
    authClient.login({
      maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000),
      identityProvider:
        !!opt?.type && opt?.type === AuthNetworkTypeEnum.Values.NFID
          ? opt?.network + AUTH_PATH
          : NETWORK_AUTHORIZE_PATH,
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

export const handleSeedAuthenticated = async (seed: string) => {
  if (seed.length > 32) return;

  if (seed.length === 0) {
    const identity = new AnonymousIdentity();
    handleLoginApp(identity);
    return;
  }

  const seedToIdentity: (seed: string) => Identity | null = (seed) => {
    const seedBuf = new Uint8Array(new ArrayBuffer(32));
    seedBuf.set(new TextEncoder().encode(seed));
    return Ed25519KeyIdentity.generate(seedBuf);
  };

  const newIdentity = seedToIdentity(seed);

  if (newIdentity) {
    store.dispatch(setDebugMode(true));
    handleLoginApp(newIdentity, true);
  }
};

export const handlePrincipalAuthenticated = async (principalAddress: string) => {
  try {
    db().setDbLocation(DB_Type.LOCAL);
    const authClient = await AuthClient.create();
    const principal = Principal.fromText(principalAddress);
    handleLoginApp(authClient.getIdentity(), false, principal);
  } catch {
    return;
  }
};

export const handleMnemonicAuthenticated = (phrase: string[]) => {
  const phraseToIdentity: (phrase: string[]) => Identity | null = (phrase) => {
    return Secp256k1KeyIdentity.fromSeedPhrase(phrase) as any;
  };
  const secpIdentity = phraseToIdentity(phrase) as Identity;
  handleLoginApp(secpIdentity, true);
};

export const handleSiweAuthenticated = async (identity: DelegationIdentity) => {
  handleLoginApp(identity);
};

/**
 * Initialize the essential data after successful login
 * - Set the user agent, principal, and authenticated status
 * - Initialize the data for new user or set the last cached data
 * - Refresh the cached data in a background process after success login
 */
export const handleLoginApp = async (authIdentity: Identity, fromSeed?: boolean, fixedPrincipal?: Principal) => {
  const opt: AuthNetwork | null = db().getNetworkType();

  if (opt === null && !fromSeed && !fixedPrincipal) {
    logout();
    return;
  }

  store.dispatch(setAuthLoading(true));

  const myAgent = new HttpAgent({
    identity: authIdentity,
    host: HTTP_AGENT_HOST,
  });
  store.dispatch(setUserAgent(myAgent));

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

  if (!fixedPrincipal) {
    // HPL FT
    const hplFTsData = localStorage.getItem("hplFT-" + identityPrincipalStr);
    if (hplFTsData != null) {
      const hplFTsDataJson = JSON.parse(hplFTsData).ft as HPLAssetData[];
      store.dispatch(setHPLAssetsData(hplFTsDataJson));
    }
    // HPL DICTIONARY
    const hplDictPrin = localStorage.getItem("hpl-dict-pric-" + identityPrincipalStr) || "lpwlq-2iaaa-aaaap-ab2vq-cai";

    store.dispatch(setHplDictionaryPrincipal(hplDictPrin));
    if (hplDictPrin && hplDictPrin !== "") {
      try {
        const dictActor = Actor.createActor<DictionaryActor>(DictionaryIDLFactory, {
          agent: myAgent,
          canisterId: hplDictPrin,
        });
        const dictFTs = await dictActor.allTokens();
        store.dispatch(setHPLDictionary(parseFungibleToken(dictFTs)));
      } catch (e) {
        console.log("dictFTs-err:", e);
        localStorage.setItem("hpl-dict-pric-" + identityPrincipalStr, "");
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
      } catch (e) {
        console.log("hplContactsDataJson-err", e);
        //
      }
    }
    // HPL OWNERS
    const ownerActor = Actor.createActor<OwnersActor>(OwnersIDLFactory, {
      agent: myAgent,
      canisterId: "n65ik-oqaaa-aaaag-acb4q-cai",
    });
    store.dispatch(setOwnersActor(ownerActor));

    // HPL MINTER
    const mintActor = Actor.createActor<HplMintActor>(HplMintIDLFactory, {
      agent: myAgent,
      canisterId: "n65ik-oqaaa-aaaag-acb4q-cai",
    });
    store.dispatch(setMintActor(mintActor));

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

  dispatchAuths(identityPrincipalStr.toLocaleLowerCase(), myPrincipal);

  await db().setIdentity(authIdentity, fixedPrincipal);

  const snsTokens = await getSNSTokens(myAgent);
  store.dispatch(setICRC1SystemAssets(snsTokens));
  store.dispatch(setAuthenticated(true, false, !!fixedPrincipal, identityPrincipalStr.toLocaleLowerCase()));
  store.dispatch(setInitLoad(false));
};

export const dispatchAuths = (identityPrincipal: string, myPrincipal: Principal) => {
  store.dispatch(setUserPrincipal(myPrincipal));
  store.dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
  store.dispatch(setStorageCode("contacts-" + identityPrincipal));
  store.dispatch(setStorageCodeA("contacts-" + identityPrincipal));
};

export const logout = async () => {
  const authClient = await AuthClient.create();
  await authClient.logout();
  store.dispatch({ type: "USER_LOGGED_OUT" });
  await db().setIdentity(null);
  store.dispatch(clearDataContacts());
  store.dispatch(clearDataAsset());
  store.dispatch(clearDataAuth());
  store.dispatch(setUnauthenticated());
  store.dispatch(setUserAgent(undefined));
  store.dispatch(setUserPrincipal(undefined));
  store.dispatch({
    type: "USER_LOGGED_OUT",
  });
  store.dispatch(setTransactions([]));
};
