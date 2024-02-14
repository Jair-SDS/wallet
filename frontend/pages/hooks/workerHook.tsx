import { AssetSymbolEnum, WorkerTaskEnum } from "@/const";
import { defaultTokens } from "@/defaultTokens";
import { hexToUint8Array } from "@/utils";
import contactCacheRefresh from "@pages/contacts/helpers/contacts";
import { allowanceCacheRefresh } from "@pages/home/helpers/allowanceCache";
// import { AssetList, Metadata } from "@candid/metadata/service.did";
import store, { useAppDispatch, useAppSelector } from "@redux/Store";
import {
  getAllTransactionsICP,
  getAllTransactionsICRC1,
  updateAllBalances,
  updateHPLBalances,
} from "@redux/assets/AssetActions";
import { setLoading, setTokens, setTxWorker } from "@redux/assets/AssetReducer";
import { Asset, SubAccount } from "@redux/models/AccountModels";
import { Token } from "@redux/models/TokenModels";
import timer_script from "@pages/workers/timerWorker";
import { useEffect } from "react";

export const WorkerHook = () => {
  const dispatch = useAppDispatch();
  const { tokens, assets, txWorker, ingressActor, ownersActor } = useAppSelector((state) => state.asset);
  const { hplContacts } = useAppSelector((state) => state.contacts);
  const { authClient, userAgent } = useAppSelector((state) => state.auth);

  const getTransactionsWorker = async () => {
    assets.map((elementA: Asset) => {
      if (elementA.tokenSymbol === AssetSymbolEnum.Enum.ICP || elementA.tokenSymbol === AssetSymbolEnum.Enum.OGY) {
        elementA.subAccounts.map(async (elementS: SubAccount) => {
          let transactionsICP = await getAllTransactionsICP(
            elementS.sub_account_id,
            false,
            elementA.tokenSymbol === AssetSymbolEnum.Enum.OGY,
          );

          store.dispatch(
            setTxWorker({
              tx: transactionsICP,
              symbol: elementA.symbol,
              tokenSymbol: elementA.tokenSymbol,
              subaccount: elementS.sub_account_id,
            }),
          );
        });
      } else {
        const selectedToken = tokens.find((tk: Token) => tk.symbol === elementA?.symbol);
        if (selectedToken && selectedToken?.index !== "") {
          elementA.subAccounts.map(async (elementS: SubAccount) => {
            let transactionsICRC1 = await getAllTransactionsICRC1(
              selectedToken?.index || "",
              hexToUint8Array(elementS?.sub_account_id || "0x0"),
              false,
              elementA.tokenSymbol,
              selectedToken.address,
              elementS?.sub_account_id,
            );

            store.dispatch(
              setTxWorker({
                tx: transactionsICRC1,
                symbol: elementA.symbol,
                tokenSymbol: elementA.tokenSymbol,
                subaccount: elementS.sub_account_id,
              }),
            );
          });
        }
      }
    });
  };

  const getAssetsWorker = async () => {
    // ICRC1
    dispatch(setLoading(true));
    const userData = localStorage.getItem(authClient);
    if (userData) {
      const userDataJson = JSON.parse(userData);
      store.dispatch(setTokens(userDataJson.tokens));
      await updateAllBalances(userAgent, userDataJson.tokens, false, false);
    } else {
      const { tokens } = await updateAllBalances(userAgent, defaultTokens, true, false);
      store.dispatch(setTokens(tokens));
    }
    const myPrincipal = await userAgent.getPrincipal();
    await contactCacheRefresh(myPrincipal.toText());
    await allowanceCacheRefresh(myPrincipal.toText());

    // HPL
    const nLocalHpl = {
      nAccounts: store.getState().asset.nHpl.nAccounts || "0",
      nVirtualAccounts: store.getState().asset.nHpl.nVirtualAccounts || "0",
      nFtAssets: store.getState().asset.nHpl.nFtAssets || "0",
    };
    await updateHPLBalances(ingressActor, ownersActor, hplContacts, authClient, true, false, nLocalHpl);

    dispatch(setLoading(false));
  };

  // TRANSACTION WEB WORKER
  let timerWorker = new Worker(timer_script, { type: "module", credentials: "include" });

  timerWorker.onmessage = (event) => {
    if (event.data && event.data.debug) {
      if (event.data) {
        console.log("message from worker: %o", event.data);
      }
    } else {
      if (event.data.wType === WorkerTaskEnum.Values.TRANSACTIONS) {
        getTransactionsWorker();
      } else if (event.data.wType === WorkerTaskEnum.Values.ASSETS) {
        console.log("updatedAt:", new Date(event.data.updatedAt));

        getAssetsWorker();
      }
    }
  };

  timerWorker.onerror = (event) => {
    console.log(event);
  };

  const clearTimeWorker = () => {
    timerWorker.terminate();
  };

  useEffect(() => {
    let postRequest = {
      message: true,
    };

    timerWorker.postMessage(postRequest);
    return () => {
      timerWorker.terminate();
    };
  }, []);

  return { txWorker, clearTimeWorker };
};
