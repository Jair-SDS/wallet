// svgs
import SearchIcon from "@assets/svg/files/icon-search.svg";
import { ReactComponent as PlusIcon } from "@assets/svg/files/plus-icon.svg";
import ChevronRightIcon from "@assets/svg/files/chevron-right-icon.svg";
import ChevronRightDarkIcon from "@assets/svg/files/chevron-right-dark-icon.svg";
//
import { ChangeEvent, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CustomInput } from "@components/Input";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { ThemeHook } from "@pages/hooks/themeHook";
import { IconTypeEnum, ProtocolTypeEnum, ThemesEnum } from "@/const";
import { CustomCheck } from "@components/CheckBox";
import Modal from "@components/Modal";
import { clsx } from "clsx";
import { Asset, HPLAsset } from "@redux/models/AccountModels";
import { useHPL } from "@pages/hooks/hplHook";
import AddEditHplContact from "./HPL/addHplContact";
import { IUseContactFilters } from "../hooks/useContactFilters";
import { IconButton } from "@components/button";
import AddContact from "./ICRC/AddContact";

const ContactFilters = ({
  searchKey,
  assetFilter,
  setSearchKey,
  setAssetFilter,
  edit,
  setEdit,
  setAddOpen,
  addOpen,
  assetOpen,
  setAssetOpen,
}: IUseContactFilters) => {
  const { t } = useTranslation();
  const { theme } = ThemeHook();
  const { assets, getAssetIcon, hplFTs, protocol } = GeneralHook();
  const { getAssetLogo, getFtFromSub } = useHPL(false);
  const [assetSearch, setAssetSearch] = useState("");

  return (
    <Fragment>
      <div className="flex flex-row items-center justify-start w-full gap-3 text-md">
        <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("asset")}</p>

        <DropdownMenu.Root
          onOpenChange={(e: boolean) => {
            setAssetOpen(e);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <div className="flex flex-row justify-start items-center border border-BorderColorLight dark:border-BorderColor rounded px-2 py-1 w-[14rem] h-[2.5rem] bg-PrimaryColorLight dark:bg-SecondaryColor cursor-pointer">
              <div className="flex flex-row justify-between items-center w-full">
                {assetFilter.length === 0 ||
                (protocol === ProtocolTypeEnum.Enum.ICRC1 && assetFilter.length === assets.length) ||
                (protocol === ProtocolTypeEnum.Enum.HPL && assetFilter.length === hplFTs.length) ? (
                  <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("all")}</p>
                ) : assetFilter.length === 1 ? (
                  protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
                    <div className="flex flex-start justify-start items-center gap-2">
                      {getAssetIcon(
                        IconTypeEnum.Enum.FILTER,
                        assetFilter[0],
                        assets.find((ast) => ast.tokenSymbol === assetFilter[0])?.logo,
                      )}
                      <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{assetFilter[0]}</p>
                    </div>
                  ) : (
                    <div className="p-1 flex flex-row justify-start items-center w-full gap-2 text-sm">
                      <img src={getAssetLogo(assetFilter[0])} className="w-8 h-8" alt="info-icon" />
                      <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                        <p className=" text-PrimaryTextColor">{assetFilter[0]}</p>
                      </div>
                      <p>{`${getFtFromSub(assetFilter[0]).name !== "" ? getFtFromSub(assetFilter[0]).name : ""}${
                        getFtFromSub(assetFilter[0]).name !== "" && getFtFromSub(assetFilter[0]).symbol !== ""
                          ? " / "
                          : ""
                      }${getFtFromSub(assetFilter[0]).symbol !== "" ? getFtFromSub(assetFilter[0]).symbol : ""}`}</p>
                    </div>
                  )
                ) : (
                  <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{`${assetFilter.length} ${t(
                    "selections",
                  )}`}</p>
                )}
                <img
                  src={theme === ThemesEnum.enum.dark ? ChevronRightIcon : ChevronRightDarkIcon}
                  className={`${assetOpen ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"} ml-1`}
                  alt="chevron-icon"
                />
              </div>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="text-md bg-PrimaryColorLight w-[14rem] rounded-lg dark:bg-SecondaryColor scroll-y-light z-[2000] max-h-80 text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-BorderColorLight dark:border-BorderColor/20"
              sideOffset={2}
              align="end"
            >
              {protocol === ProtocolTypeEnum.Enum.HPL && (
                <div className="flex w-full px-3 py-2">
                  <CustomInput
                    prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
                    sizeInput={"small"}
                    intent={"secondary"}
                    placeholder=""
                    compOutClass=""
                    value={assetSearch}
                    onChange={onSearchChange}
                  />
                </div>
              )}
              <div
                onClick={handleSelectAll}
                className="flex flex-row items-center justify-between w-full px-3 py-2 rounded-t-lg hover:bg-HoverColorLight hover:dark:bg-HoverColor"
              >
                <p>{t("selected.all")}</p>
                <CustomCheck
                  className="border-BorderColorLight dark:border-BorderColor"
                  checked={
                    (assetFilter.length === assets.length && protocol === ProtocolTypeEnum.Enum.ICRC1) ||
                    (assetFilter.length === hplFTs.length && protocol === ProtocolTypeEnum.Enum.HPL)
                  }
                />
              </div>
              {protocol === ProtocolTypeEnum.Enum.ICRC1 &&
                assets.map((asset, k) => {
                  return (
                    <div
                      key={k}
                      className={assetStyle(k, assets)}
                      onClick={() => {
                        handleSelectAsset(asset);
                      }}
                    >
                      <div className="flex flex-start justify-start items-center gap-2">
                        {getAssetIcon(IconTypeEnum.Enum.FILTER, asset.tokenSymbol, asset.logo)}
                        <p>{asset.symbol}</p>
                      </div>

                      <CustomCheck
                        className="border-BorderColorLight dark:border-BorderColor"
                        checked={assetFilter.includes(asset.tokenSymbol)}
                      />
                    </div>
                  );
                })}
              {protocol === ProtocolTypeEnum.Enum.HPL &&
                hplFTs
                  .filter((ft) => {
                    const key = assetSearch.toLowerCase();
                    return (
                      ft.name.toLowerCase().includes(key) ||
                      ft.symbol.toLowerCase().includes(key) ||
                      ft.id.toString().includes(key)
                    );
                  })
                  .map((ft, k) => {
                    return (
                      <div
                        key={k}
                        className="p-1 flex flex-row justify-between items-center px-3 w-full text-sm hover:bg-HoverColorLight2 dark:hover:bg-HoverColor"
                        onClick={() => {
                          handleSelectFt(ft);
                        }}
                      >
                        <div className="flex flex-row justify-start items-center gap-2">
                          <img src={getAssetLogo(ft.id)} className="w-6 h-6" alt="info-icon" />
                          <div className="flex justify-center items-center  px-1 bg-slate-500 rounded-md">
                            <p className=" text-PrimaryTextColor">{ft.id.toString()}</p>
                          </div>
                          <p>{`${ft.name !== "" ? ft.name : ""}${ft.name !== "" && ft.symbol !== "" ? " - " : ""}${
                            ft.symbol !== "" ? ft.symbol : ""
                          }`}</p>
                        </div>

                        <CustomCheck
                          className="border-BorderColorLight dark:border-BorderColor"
                          checked={assetFilter.includes(ft.id)}
                        />
                      </div>
                    );
                  })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <CustomInput
          compOutClass="!w-[40%]"
          prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
          intent={"secondary"}
          sizeInput={"medium"}
          placeholder={t(protocol === ProtocolTypeEnum.Enum.HPL ? "search" : "search.contact")}
          value={searchKey}
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
        />
        <IconButton
          icon={<PlusIcon className="w-6 h-6" />}
          size="medium"
          onClick={() => {
            setEdit(undefined);
            setAddOpen(true);
          }}
        />
      </div>
      <Modal
        open={addOpen}
        width="w-[48rem]"
        padding="py-5 px-8"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
        overlayZIndex="1000"
        contentZIndex="2000"
      >
        {protocol === ProtocolTypeEnum.Enum.HPL ? (
          <AddEditHplContact setAddOpen={setAddOpen} edit={edit} />
        ) : (
          <AddContact setAddOpen={setAddOpen} />
        )}
      </Modal>
    </Fragment>
  );

  function handleSelectAll() {
    let symbols: string[] = [];
    if (
      (assetFilter.length === assets.length && protocol === ProtocolTypeEnum.Enum.ICRC1) ||
      (assetFilter.length === hplFTs.length && protocol === ProtocolTypeEnum.Enum.HPL)
    )
      setAssetFilter([]);
    else {
      if (protocol === ProtocolTypeEnum.Enum.ICRC1) {
        symbols = assets.map((ast) => {
          return ast.tokenSymbol;
        });
      } else {
        symbols = hplFTs.map((ft) => {
          return ft.id;
        });
      }
      setAssetFilter(symbols);
    }
  }

  function handleSelectAsset(asset: Asset) {
    if (assetFilter.includes(asset.tokenSymbol)) {
      const auxSymbols = assetFilter.filter((ast) => ast !== asset.tokenSymbol);
      setAssetFilter(auxSymbols);
    } else setAssetFilter([...assetFilter, asset.tokenSymbol]);
  }

  function handleSelectFt(ft: HPLAsset) {
    if (assetFilter.includes(ft.id)) {
      const auxSymbols = assetFilter.filter((ast) => ast !== ft.id);
      setAssetFilter(auxSymbols);
    } else setAssetFilter([...assetFilter, ft.id]);
  }

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setAssetSearch(e.target.value);
  }
};

export default ContactFilters;

// Tailwind CSS
const assetStyle = (k: number, assets: Asset[]) =>
  clsx({
    ["flex flex-row justify-between items-center px-3 py-2 w-full hover:bg-HoverColorLight2 hover:dark:bg-HoverColor"]:
      true,
    ["rounded-b-lg"]: k === assets.length - 1,
  });
