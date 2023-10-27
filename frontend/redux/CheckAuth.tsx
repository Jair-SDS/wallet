/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import store from "./Store";
import {
  clearDataAuth,
  setAuthLoading,
  setAuthenticated,
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
  setHPLSubsData,
  setHPLVTsData,
  setIngressActor,
  setTokens,
} from "./assets/AssetReducer";
import { AuthNetwork } from "./models/TokenModels";
import { AuthNetworkTypeEnum, RoutingPathEnum, defaultTokens } from "@/const";
import { clearDataContacts, setContacts, setStorageCode } from "./contacts/ContactsReducer";
import { HPLClient } from "@research-ag/hpl-client";
import { _SERVICE as IngressActor } from "@candid/service.did.d";
import { idlFactory as IngressIDLFactory } from "@candid/candid.did";
import { Principal } from "@dfinity/principal";

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
          : "https://identity.ic0.app",
      onSuccess: () => {
        handleLoginApp(authClient.getIdentity());
        resolve();
      },
      onError: (e) => {
        console.error("onError", e);
        store.dispatch(setUnauthenticated());
        reject();
      },
    });
  });
};

export const handleLoginApp = async (authIdentity: Identity) => {
  if (localStorage.getItem("network_type") === null) logout();
  const opt: AuthNetwork = JSON.parse(localStorage.getItem("network_type") || "");

  store.dispatch(setAuthLoading(true));
  const myAgent = new HttpAgent({
    identity: authIdentity,
    host:
      opt?.type === AuthNetworkTypeEnum.Values.NFID && opt?.type !== undefined && opt?.type !== null
        ? opt?.network + AUTH_PATH
        : import.meta.env.VITE_AGGENT_HOST,
  });

  const myPrincipal = await myAgent.getPrincipal();

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

  // HPL FT
  const hplFTsData = localStorage.getItem("hplFT-" + authIdentity.getPrincipal().toString());
  if (hplFTsData != null) {
    const hplFTsDataJson = JSON.parse(hplFTsData);
    store.dispatch(setHPLAssetsData(hplFTsDataJson.ft));
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

  store.dispatch(setAuthenticated(true, false, authIdentity.getPrincipal().toText().toLowerCase()));
  store.dispatch(setStorageCode("contacts-" + authIdentity.getPrincipal().toText().toLowerCase()));
  store.dispatch(setUserAgent(myAgent));
  store.dispatch(setUserPrincipal(myPrincipal));
  store.dispatch(setRoutingPath(RoutingPathEnum.Enum.HOME));
  // HPL TOKENS

  const client = new HPLClient("rqx66-eyaaa-aaaap-aaona-cai", "ic");
  await client.setIdentity(authIdentity as any);
  store.dispatch(setHPLClient(client));
  await updateHPLBalances(client);

  try {
    const ingressActor = Actor.createActor<IngressActor>(IngressIDLFactory, {
      agent: myAgent,
      canisterId: "rqx66-eyaaa-aaaap-aaona-cai",
    });
    store.dispatch(setIngressActor(ingressActor));
    const a = await ingressActor.remoteAccountInfo({
      idRange: [Principal.fromText("af76t-ckh44-h7nkx-idaq4-jw3ux-izeag-kb6ge-sar3p-wrxhb-ybfah-hae"), BigInt(0), []],
    });
    console.log("remotes", a);
  } catch (e) {
    console.log(e);
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
