// svgs
import PlusIcon from "@assets/svg/files/plus-icon.svg";
//
import AssetElement from "./ICRC/AssetElement";
import { Asset, HPLSubAccount } from "@redux/models/AccountModels";
import { ChangeEvent, Fragment, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import AddAsset from "./ICRC/AddAsset";
import { DrawerHook } from "../hooks/drawerHook";
import { useTranslation } from "react-i18next";
import Menu from "@pages/components/Menu";
import { WorkerHook } from "@pages/hooks/workerHook";
import { AssetHook } from "../hooks/assetHook";
import { UseAsset } from "../hooks/useAsset";
import { ProtocolTypeEnum } from "@/const";
import HplSubaccountElem from "./HPL/HplSubaccountElem";
import AddSubaccount from "./HPL/AddSubaccount";
import { useHPL } from "@pages/hooks/hplHook";
import EditHplAsset from "./HPL/EditHplAsset";

const AssetsList = () => {
  const { t } = useTranslation();
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
        <div className="grid grid-cols-[1fr_auto] justify-start items-center w-full mb-2 pl-4 gap-3 pr-5">
          <input
            className="dark:bg-PrimaryColor bg-PrimaryColorLight text-PrimaryTextColorLight dark:text-PrimaryTextColor border-SearchInputBorderLight dark:border-SearchInputBorder w-full h-8 rounded-lg border-[1px] outline-none px-3 text-md"
            type="text"
            placeholder={t("search")}
            value={protocol === ProtocolTypeEnum.Enum.HPL ? searchKeyHPL : searchKey}
            onChange={setSearch}
            spellCheck={false}
            autoComplete="false"
          />
          <div
            className="grid  justify-center items-center w-8 h-8 bg-SelectRowColor rounded-md cursor-pointer"
            onClick={onAddAsset}
          >
            <img src={PlusIcon} alt="plus-icon" />
          </div>
        </div>
        {protocol === ProtocolTypeEnum.Enum.HPL && (
          <div className="flex flex-row justify-between items-center w-full pr-5 pl-4 mb-3 mt-2 text-PrimaryTextColorLight dark:text-PrimaryTextColor">
            <div className="flex flex-row justify-start items-center gap-2">
              <p className="text-md">{t("non.zero.balance")}</p>
              <div
                className={`flex flex-row w-9 h-4 rounded-full relative cursor-pointer items-center ${
                  zeroBalance ? "bg-[#26A17B]" : "bg-[#7E7D91]"
                }`}
                onClick={handleFilterNonZeroBalances}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-spacing duration-300 ${
                    zeroBalance ? "ml-5" : "ml-1"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div
          className={`w-full ${
            protocol === ProtocolTypeEnum.Enum.HPL ? "max-h-[calc(100vh-16rem)]" : "max-h-[calc(100vh-13rem)]"
          } scroll-y-light`}
        >
          {protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
            <Accordion.Root
              className=""
              type="multiple"
              defaultValue={[]}
              value={
                (addOpen || assetOpen) && selectedAsset ? [...acordeonIdx, selectedAsset.tokenSymbol] : acordeonIdx
              }
              onValueChange={onValueChange}
            >
              {assets?.map((asset: Asset, idx: number) => {
                const mySearchKey = searchKey.toLowerCase().trim();
                let includeInSub = false;
                asset.subAccounts.map((sa) => {
                  if (sa.name.toLowerCase().includes(mySearchKey)) includeInSub = true;
                });

                if (
                  asset.name.toLowerCase().includes(mySearchKey) ||
                  asset.symbol.toLowerCase().includes(mySearchKey) ||
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
