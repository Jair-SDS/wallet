import Menu from "@pages/components/Menu";
import { Fragment, useEffect } from "react";
import { useAssetList } from "./hooks/assetListHook";
import AssetsFilter from "./components/assetsFilter";
import AssetListTable from "./components/assetsList";
import AddSubaccount from "@pages/home/components/HPL/AddSubaccount";
import { DrawerHook } from "@pages/home/hooks/drawerHook";

const Assets = () => {
  const { searchKey, setSearchKey, allAssets, setAllAssets, assetList, subsInAsset, selAsset, setSelAsset } =
    useAssetList();
  const { assetOpen, setAssetOpen } = DrawerHook();

  useEffect(() => {
    !assetOpen && setSelAsset(undefined);
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
          />
          <div
            id="asset-drower"
            className={`h-full fixed top-0 w-[28rem] z-[1000] overflow-x-hidden transition-{right} duration-500 ${
              assetOpen ? "!right-0" : "right-[-30rem]"
            }`}
          >
            <AddSubaccount setAssetOpen={setAssetOpen} open={assetOpen} extAsset={selAsset} />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Assets;
