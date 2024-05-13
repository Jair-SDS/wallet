import { db } from "@/database/db";
import contactCacheRefresh from "@pages/contacts/helpers/contactCacheRefresh";
import { allowanceCacheRefresh } from "@pages/home/helpers/allowanceCache";
import { updateAllBalances, updateHPLBalances } from "@redux/assets/AssetActions";
import { setAppDataRefreshing, setLastDataRefresh } from "@redux/common/CommonReducer";
import store from "@redux/Store";
import dayjs from "dayjs";

export default async function reloadBallance() {
  try {
    store.dispatch(setAppDataRefreshing(true));

    const dbAssets = await db().getAssets();

    await updateAllBalances({
      myAgent: store.getState().auth.userAgent,
      assets: dbAssets,
      fromLogin: true,
      basicSearch: true,
    });

    await allowanceCacheRefresh();
    await contactCacheRefresh();

    await updateHPLBalances(
      store.getState().asset.ingressActor,
      store.getState().asset.ownersActor,
      store.getState().contacts.hplContacts,
      store.getState().auth.authClient,
      false,
      true,
    );

    store.dispatch(setLastDataRefresh(dayjs().toISOString()));
    store.dispatch(setAppDataRefreshing(false));
  } catch (e) {
    console.error("Error reloading balance", e);
  }
}
