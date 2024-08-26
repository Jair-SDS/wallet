/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Actor, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";
import store from "./Store";
import logger from "@/common/utils/logger";
import {
  setAuthLoading,
  setAuthenticated,
  setDbLocation,
  setDebugMode,
  setHplDictionaryPrincipal,
  setHplLedgerPrincipal,
  setRoutingPath,
  setUnauthenticated,
  setUserAgent,
  setUserPrincipal,
} from "@/redux/auth/AuthReducer";
import { AuthClient } from "@dfinity/auth-client";
import { updateHPLBalances, getSNSTokens } from "./assets/AssetActions";
import { setInitLoad, setICRC1SystemAssets } from "./assets/AssetReducer";
import { AuthNetwork } from "./models/TokenModels";
import { AuthNetworkTypeEnum, ProtocolTypeEnum, RoutingPathEnum } from "@/common/const";
import { Ed25519KeyIdentity, DelegationIdentity } from "@dfinity/identity";
import { HPLClient } from "@research-ag/hpl-client";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { idlFactory as IngressIDLFactory } from "@candid/HPL/candid.did";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";
import { idlFactory as OwnersIDLFactory } from "@candid/Owners/candid.did";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { idlFactory as HplMintIDLFactory } from "@candid/HplMint/candid.did";
import { HPLAssetData, HPLSubData, HPLVirtualData, HplContact } from "./models/AccountModels";
import { Principal } from "@dfinity/principal";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { db, DB_Type } from "@/database/db";
import { addWatchOnlySessionToLocal } from "@pages/helpers/watchOnlyStorage";
import watchOnlyRefresh from "@pages/helpers/watchOnlyRefresh";
import { setProtocol, setStorageCodeA } from "./common/CommonReducer";
import {
  setFeeConstant,
  setHPLAssetsData,
  setHPLClient,
  setHPLDictionary,
  setHPLSubsData,
  setHPLVTsData,
  setIngressActor,
  setMintActor,
  setOwnersActor,
} from "./hpl/HplReducer";
import { parseFungibleToken } from "@common/utils/hpl";
import { clearServiceData } from "./services/ServiceReducer";

const AUTH_PATH = `/authenticate/?applicationName=${import.meta.env.VITE_APP_NAME}&applicationLogo=${
  import.meta.env.VITE_APP_LOGO
}#authorize`;

export const NETWORK_AUTHORIZE_PATH = "https://identity.ic0.app/#authorize";
export const HTTP_AGENT_HOST = "https://identity.ic0.app";

export const handleAuthenticated = async (opt: AuthNetwork) => {
  try {
    const authClient = await AuthClient.create();
    await new Promise<void>((resolve, reject) => {
      authClient.login({
        maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000),
        identityProvider:
          !!opt?.type && opt?.type === AuthNetworkTypeEnum.Values.NFID
            ? opt?.network + AUTH_PATH
            : NETWORK_AUTHORIZE_PATH,
        derivationOrigin: `${import.meta.env.VITE_DERIVATION_ORIGIN}`,
        onSuccess: () => {
          handleLoginApp(authClient.getIdentity());
          store.dispatch(setDebugMode(false));
          resolve();
        },
        onError: (e) => {
          logger.debug("onError", e);
          store.dispatch(setUnauthenticated());
          store.dispatch(setDebugMode(false));
          reject();
        },
      });
    });
  } catch (error) {
    logger.debug(error);
  }
};

export const handleSiweAuthenticated = async (identity: DelegationIdentity) => {
  handleLoginApp(identity);
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
    store.dispatch(setDbLocation(DB_Type.LOCAL));
    const authClient = await AuthClient.create();
    const principal = Principal.fromText(principalAddress);
    store.dispatch(setProtocol(ProtocolTypeEnum.Enum.ICRC1));
    addWatchOnlySessionToLocal({ alias: "", principal: principalAddress });
    watchOnlyRefresh();
    await handleLoginApp(authClient.getIdentity(), false, principal);
  } catch (error) {
    logger.debug("Error parsing principal", error);
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

  await db().setIdentity(authIdentity, myPrincipal);

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
    let hplFTsData: HPLAssetData[] | null = null;
    try {
      hplFTsData = await db().getHplAssets();
    } catch (error) {
      logger.error("dbFtData:", error);
    }
    // const hplFTsData = localStorage.getItem("hplFT-" + identityPrincipalStr);
    if (hplFTsData != null) {
      // const hplFTsDataJson = JSON.parse(hplFTsData).ft as HPLAssetData[];
      store.dispatch(setHPLAssetsData(hplFTsData));
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
        logger.debug("dictFTs-err:", e);
        localStorage.setItem("hpl-dict-pric-" + identityPrincipalStr, "");
      }
    }
    // HPL SUBACCOUNTS
    // const hplSubsData = localStorage.getItem("hplSUB-" + identityPrincipalStr);
    let hplSubsData: HPLSubData[] | null = null;
    try {
      hplSubsData = await db().getHplSubaccounts();
    } catch (error) {
      logger.debug("dbSubData:", error);
    }
    if (hplSubsData != null) {
      // const hplSubsDataJson = JSON.parse(hplSubsData);
      store.dispatch(setHPLSubsData(hplSubsData));
    }
    // HPL VIRTUALS
    let hplVTsData: HPLVirtualData[] | null = null;
    try {
      hplVTsData = await db().getHplVirtuals();
    } catch (error) {
      logger.debug("dbVtData:", error);
    }
    if (hplVTsData != null) {
      // const hplVTsDataJson = JSON.parse(hplVTsData);
      store.dispatch(setHPLVTsData(hplVTsData));
    }
    // HPL CONTACTS
    let hplContactsData: HplContact[] | null = null;
    // let hplContactsDataJson: { contacts: HplContact[] } = { contacts: [] };
    // const hplContactsData = localStorage.getItem("hpl-contacts-" + identityPrincipalStr);
    try {
      hplContactsData = await db().getHplContacts();
    } catch (error) {
      logger.debug("dbHplCntcData:", error);
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
    await updateHPLBalances(ingressActor, ownerActor, hplContactsData || [], identityPrincipalStr, false, forceUpdate);
    try {
      const feeConstant = await ingressActor.feeRatio();
      store.dispatch(setFeeConstant(Number(feeConstant.toString())));
    } catch (e) {
      logger.debug("feeConstant-err", e);
    }
  }

  store.dispatch(setAuthenticated(true, false, !!fixedPrincipal, identityPrincipalStr.toLocaleLowerCase()));
  dispatchAuths(identityPrincipalStr.toLocaleLowerCase(), myPrincipal);

  const snsTokens = await getSNSTokens(myAgent);
  store.dispatch(setICRC1SystemAssets(snsTokens));
  store.dispatch(setInitLoad(false));
};

export const dispatchAuths = (identityPrincipal: string, myPrincipal: Principal) => {
  store.dispatch(setUserPrincipal(myPrincipal));
  store.dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
  store.dispatch(setStorageCodeA("contacts-" + identityPrincipal));
};

export const logout = async () => {
  store.dispatch({ type: "USER_LOGGED_OUT" });
  await db().setIdentity(null);
  cleanEthLogin();
  store.dispatch(clearServiceData());
  window.location.reload();
};

export const cleanEthLogin = () => {
  localStorage.removeItem("wagmi.store");
  localStorage.removeItem("network_type");
  localStorage.removeItem("rk-latest-id");
  localStorage.removeItem("rk-recent");
  localStorage.removeItem("wagmi.wallet");
  localStorage.removeItem("rk-version");
  localStorage.removeItem("wagmi.metaMask.shimDisconnect");
  localStorage.removeItem("wagmi.connected");
  localStorage.removeItem("-walletlink:https://www.walletlink.org:version");
  localStorage.removeItem("-walletlink:https://www.walletlink.org:session:id");
  localStorage.removeItem("-walletlink:https://www.walletlink.org:session:secret");
  localStorage.removeItem("-walletlink:https://www.walletlink.org:session:linked");
  localStorage.removeItem("wagmi.cache");
  localStorage.removeItem("WCM_VERSION");
  indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
  indexedDB.deleteDatabase("auth-client-db");
};
