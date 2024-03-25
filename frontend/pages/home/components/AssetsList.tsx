//
import AssetElement from "./ICRC/asset/AssetElement";
import { Asset, HPLSubAccount } from "@redux/models/AccountModels";
import { ChangeEvent, Fragment, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import AddAsset from "./ICRC/asset/AddAsset";
import { DrawerHook } from "../hooks/drawerHook";
import { AssetHook } from "../hooks/assetHook";
import { UseAsset } from "../hooks/useAsset";
import { ProtocolTypeEnum } from "@/const";
import HplSubaccountElem from "./HPL/HplSubaccountElem";
import AddSubaccount from "./HPL/AddSubaccount";
import { useHPL } from "@pages/hooks/hplHook";
import EditHplAsset from "./HPL/EditHplAsset";
import Menu from "@pages/components/Menu";
import { WorkerHook } from "@pages/hooks/workerHook";
import SearchAsset from "./ICRC/asset/SearchAsset";

const AssetsList = () => {
  WorkerHook();
  UseAsset();
  const { assetOpen, setAssetOpen } = DrawerHook();
  const {
    protocol,
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
  const {
    editedFt,
    setEditedFt,
    editNameId,
    setEditNameId,
    zeroBalance,
    setZeroBalance,
    setSearchKeyHPL,
    searchKeyHPL,
    subsList,
  } = useHPL(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <Fragment>
      <div className="flex flex-col justify-start items-start w-[60%] max-w-[30rem] h-full pt-6 dark:bg-PrimaryColor bg-PrimaryColorLight">
        <Menu />

        <SearchAsset
          searchKey={protocol === ProtocolTypeEnum.Enum.HPL ? searchKeyHPL : searchKey}
          setSearchKey={setSearch}
          onAddAsset={onAddAsset}
          protocol={protocol}
          handleFilterNonZeroBalances={handleFilterNonZeroBalances}
          zeroBalance={zeroBalance}
        />

        <div
          className={`w-full ${
            protocol === ProtocolTypeEnum.Enum.HPL ? "max-h-[calc(100vh-16rem)]" : "max-h-[calc(100vh-13rem)]"
          } scroll-y-light`}
        >
          {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
            <Accordion.Root
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
          ) : (
            subsList?.map((sub: HPLSubAccount, idx: number) => {
              return (
                <HplSubaccountElem
                  key={idx}
                  sub={sub}
                  idx={idx}
                  setEditedFt={setEditedFt}
                  setAssetOpen={setAssetOpen}
                  editNameId={editNameId}
                  setEditNameId={setEditNameId}
                />
              );
            })
          )}
        </div>
      </div>
      <div
        id="asset-drower"
        className={`h-full fixed top-0 w-[28rem] z-[1000] overflow-x-hidden transition-{right} duration-500 ${
          assetOpen ? "!right-0" : "right-[-30rem]"
        }`}
      >
        {editedFt ? (
          <EditHplAsset
            setAssetOpen={setAssetOpen}
            open={assetOpen}
            setEditedFt={setEditedFt}
            editedFt={editedFt}
          ></EditHplAsset>
        ) : protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
          <AddAsset
            setAssetOpen={setAssetOpen}
            asset={assetInfo}
            setAssetInfo={setAssetInfo}
            tokens={tokens}
            assetOpen={assetOpen}
            assets={assets}
            acordeonIdx={acordeonIdx}
          />
        ) : (
          <AddSubaccount setAssetOpen={setAssetOpen} open={assetOpen} />
        )}
      </div>
    </Fragment>
  );

  function handleFilterNonZeroBalances() {
    const value = !zeroBalance;
    localStorage.setItem("enableZeroBalance", JSON.stringify(value));
    setZeroBalance(value);
  }

  function setSearch(e: ChangeEvent<HTMLInputElement>) {
    if (protocol === ProtocolTypeEnum.Enum.HPL) {
      setSearchKeyHPL(e.target.value);
    } else {
      setSearchKey(e.target.value);
    }
  }

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
