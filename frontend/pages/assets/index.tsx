import Menu from "@pages/components/Menu";
import { Fragment, useEffect } from "react";
import { useAssetList } from "./hooks/assetListHook";
import AssetsFilter from "./components/assetsFilter";
import AssetListTable from "./components/assetsList";
import AddSubaccount from "@pages/home/components/HPL/AddSubaccount";
import { DrawerHook } from "@pages/home/hooks/drawerHook";
import EditHplAsset from "@pages/home/components/HPL/EditHplAsset";

const Assets = () => {
  const {
    searchKey,
    setSearchKey,
    allAssets,
    setAllAssets,
    assetList,
    subsInAsset,
    selAsset,
    setSelAsset,
    editView,
    setEditView,
    getContactName,
  } = useAssetList();
  const { assetOpen, setAssetOpen } = DrawerHook();

  useEffect(() => {
    if (!assetOpen) {
      setSelAsset(undefined);
      setEditView(false);
    }
  }, [assetOpen]);
  return (
    <Fragment>
      <div className="flex flex-col w-full h-full pt-6">
        <Menu />
        <div className="flex flex-col justify-start items-start w-full h-full px-4">
          <AssetsFilter
            searchKey={searchKey}
            setSearchKey={setSearchKey}
            allAssets={allAssets}
            onAllAssetToggle={setAllAssets}
          />
          <AssetListTable
            assets={assetList}
            subsInAsset={subsInAsset}
            setAssetOpen={setAssetOpen}
            selAsset={selAsset}
            setSelAsset={setSelAsset}
            setEditView={setEditView}
            getContactName={getContactName}
          />
          <div
            id="asset-drower"
            className={`h-full fixed top-0 w-[28rem] z-[1000] overflow-x-hidden transition-{right} duration-500 ${
              assetOpen ? "!right-0" : "right-[-30rem]"
            }`}
          >
            {editView && selAsset ? (
              <EditHplAsset
                setAssetOpen={setAssetOpen}
                open={assetOpen}
                setEditedFt={setSelAsset}
                editedFt={selAsset}
              ></EditHplAsset>
            ) : (
              <AddSubaccount setAssetOpen={setAssetOpen} open={assetOpen} extAsset={selAsset} />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Assets;
