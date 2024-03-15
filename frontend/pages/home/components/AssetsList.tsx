// svgs
import PlusIcon from "@assets/svg/files/plus-icon.svg";
//
import AssetElement from "./ICRC/asset/AssetElement";
import { Asset } from "@redux/models/AccountModels";
import { Fragment, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import AddAsset from "./ICRC/asset/AddAsset";
import { DrawerHook } from "../hooks/drawerHook";
import { useTranslation } from "react-i18next";
import Menu from "@pages/components/Menu";
import { WorkerHook } from "@pages/hooks/workerHook";
import { AssetHook } from "../hooks/assetHook";
import { UseAsset } from "../hooks/useAsset";

const AssetsList = () => {
  const { t } = useTranslation();

  WorkerHook();
  UseAsset();
  const { assetOpen, setAssetOpen } = DrawerHook();
  const {
    assets,
    searchKey,
    setSearchKey,
    setAcordeonIdx,
    acordeonIdx,
    assetInfo,
    setAssetInfo,
    tokens,
    selectedAsset,
  } = AssetHook();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <Fragment>
      <div className="flex flex-col justify-start items-start w-[60%] max-w-[30rem] h-full pl-9 pt-6 dark:bg-PrimaryColor bg-PrimaryColorLight">
        <Menu />

        <div className="flex flex-row items-center justify-start w-full gap-3 pr-5 mb-4">
          <input
            className="dark:bg-PrimaryColor bg-PrimaryColorLight text-PrimaryTextColorLight dark:text-PrimaryTextColor border-SearchInputBorderLight dark:border-SearchInputBorder w-full h-8 rounded-lg border-[1px] outline-none px-3 text-md"
            type="text"
            placeholder={t("search")}
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
            }}
            autoComplete="false"
            spellCheck={false}
          />
          <div
            className="flex flex-row items-center justify-center w-8 h-8 rounded-md cursor-pointer bg-SelectRowColor"
            onClick={onAddAsset}
          >
            <img src={PlusIcon} alt="plus-icon" />
          </div>
        </div>

        <div className="w-full max-h-[calc(100vh-13rem)] scroll-y-light">
          {assets?.length > 0 && (
            <Accordion.Root
              className=""
              type="multiple"
              defaultValue={[]}
              value={
                (addOpen || assetOpen) && selectedAsset ? [...acordeonIdx, selectedAsset.tokenSymbol] : acordeonIdx
              }
              onValueChange={onValueChange}
            >
              {assets.map((asset: Asset, idx: number) => {
                const mySearchKey = searchKey.toLowerCase().trim();
                let includeInSub = false;
                asset.subAccounts.map((sa) => {
                  if (sa.name.toLowerCase().includes(mySearchKey)) includeInSub = true;
                });

                if (
                  asset.name?.toLowerCase().includes(mySearchKey) ||
                  asset.symbol?.toLowerCase().includes(mySearchKey) ||
                  includeInSub ||
                  searchKey.trim() === ""
                )
                  return (
                    <AssetElement
                      key={idx}
                      asset={asset}
                      idx={idx}
                      acordeonIdx={acordeonIdx}
                      setAssetInfo={setAssetInfo}
                      setAssetOpen={setAssetOpen}
                      tokens={tokens}
                      setAddOpen={setAddOpen}
                    />
                  );
              })}
            </Accordion.Root>
          )}
        </div>
      </div>
      <div
        id="asset-drower"
        className={`h-full fixed top-0 w-[28rem] z-[1000] overflow-x-hidden transition-{right} duration-500 ${
          assetOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        <AddAsset
          setAssetOpen={setAssetOpen}
          asset={assetInfo}
          setAssetInfo={setAssetInfo}
          tokens={tokens}
          assetOpen={assetOpen}
          assets={assets}
          acordeonIdx={acordeonIdx}
        />
      </div>
    </Fragment>
  );

  function onAddAsset() {
    setTimeout(() => {
      setAssetOpen(true);
    }, 150);
  }

  function onValueChange(e: string[]) {
    setAcordeonIdx(e);
  }
};

export default AssetsList;
