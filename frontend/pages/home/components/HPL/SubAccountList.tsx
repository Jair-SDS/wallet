import { HPLSubAccount } from "@redux/models/AccountModels";
import { Fragment } from "react";
import { useHPL } from "@pages/hooks/hplHook";
import Menu from "@pages/components/Menu";
import { DrawerHook } from "@pages/home/hooks/drawerHook";
import { AssetHook } from "@pages/home/hooks/assetHook";
import { ProtocolTypeEnum } from "@common/const";
import HplSubaccountElem from "./HplSubaccountElem";
import EditHplAsset from "./EditHplAsset";
import AddSubaccount from "./AddSubaccount";
import SearchSubaccount from "./SearchSubAccount";

const SubaccountList = () => {
  const { assetOpen, setAssetOpen } = DrawerHook();
  const { protocol } = AssetHook();
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

  return (
    <Fragment>
      <div className="flex flex-col justify-start items-start w-[60%] max-w-[30rem] h-full pt-6 dark:bg-PrimaryColor bg-PrimaryColorLight">
        <Menu />

        <SearchSubaccount
          searchKey={searchKeyHPL}
          setSearchKey={setSearchKeyHPL}
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
          {subsList?.map((sub: HPLSubAccount, idx: number) => {
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
          })}
        </div>
      </div>
      {assetOpen && (
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
          ) : (
            <AddSubaccount setAssetOpen={setAssetOpen} open={assetOpen} />
          )}
        </div>
      )}
    </Fragment>
  );

  function handleFilterNonZeroBalances() {
    const value = !zeroBalance;
    localStorage.setItem("enableZeroBalance", JSON.stringify(value));
    setZeroBalance(value);
  }

  function onAddAsset() {
    setTimeout(() => {
      setAssetOpen(true);
    }, 150);
  }
};

export default SubaccountList;
