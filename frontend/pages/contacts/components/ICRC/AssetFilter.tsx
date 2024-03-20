import { IconTypeEnum, ProtocolTypeEnum, ThemesEnum } from "@/const";
import { ThemeHook } from "@pages/hooks/themeHook";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import ChevronRightIcon from "@assets/svg/files/chevron-right-icon.svg";
import ChevronRightDarkIcon from "@assets/svg/files/chevron-right-dark-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import { Asset, HPLAsset } from "@redux/models/AccountModels";
import { clsx } from "clsx";
import { GeneralHook } from "@pages/home/hooks/generalHook";
import { useHPL } from "@pages/hooks/hplHook";
import { CustomInput } from "@components/input";
import { ChangeEvent, useState } from "react";
import { CustomCheck } from "@components/checkbox";

interface AssetFilterProps {
  setAssetOpen: (open: boolean) => void;
  assetFilter: string[];
  assetOpen: boolean;
  setAssetFilter: (filter: string[]) => void;
}

export default function AssetFilter(props: AssetFilterProps) {
  const { t } = useTranslation();
  const { theme } = ThemeHook();
  const { assets, getAssetIcon, hplFTs, protocol } = GeneralHook();
  const { getAssetLogo, getFtFromSub } = useHPL(false);
  const { setAssetOpen, assetFilter, assetOpen, setAssetFilter } = props;
  const [assetSearch, setAssetSearch] = useState("");

  return (
    <DropdownMenu.Root
      onOpenChange={(e: boolean) => {
        setAssetOpen(e);
      }}
    >
      <DropdownMenu.Trigger asChild>
        <div className="flex flex-row justify-start items-center border border-BorderColorLight dark:border-BorderColor rounded px-2 py-1 w-[14rem] h-[2.5rem] bg-PrimaryColorLight dark:bg-SecondaryColor cursor-pointer">
          <div className="flex flex-row items-center justify-between w-full">
            {assetFilter.length === 0 ||
            (protocol === ProtocolTypeEnum.Enum.ICRC1 && assetFilter.length === assets.length) ||
            (protocol === ProtocolTypeEnum.Enum.HPL && assetFilter.length === hplFTs.length) ? (
              <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("all")}</p>
            ) : assetFilter.length === 1 ? (
              protocol === ProtocolTypeEnum.Enum.ICRC1 ? (
                <div className="flex items-center justify-start gap-2 flex-start">
                  {getAssetIcon(
                    IconTypeEnum.Enum.FILTER,
                    assetFilter[0],
                    assets.find((ast) => ast.tokenSymbol === assetFilter[0])?.logo,
                  )}
                  <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{assetFilter[0]}</p>
                </div>
              ) : (
                <div className="flex flex-row items-center justify-start w-full gap-2 p-1 text-sm">
                  <img src={getAssetLogo(assetFilter[0])} className="w-8 h-8" alt="info-icon" />
                  <div className="flex items-center justify-center px-3 py-1 rounded-md bg-slate-500">
                    <p className=" text-PrimaryTextColor">{assetFilter[0]}</p>
                  </div>
                  <p>{`${getFtFromSub(assetFilter[0]).name !== "" ? getFtFromSub(assetFilter[0]).name : ""}${
                    getFtFromSub(assetFilter[0]).name !== "" && getFtFromSub(assetFilter[0]).symbol !== "" ? " / " : ""
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
              checked={assetFilter.length === assets.length}
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
                  <div className="flex items-center justify-start gap-2 flex-start">
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
                    className="flex flex-row items-center justify-between w-full p-1 px-3 text-sm hover:bg-HoverColorLight2 dark:hover:bg-HoverColor"
                    onClick={() => {
                      handleSelectFt(ft);
                    }}
                  >
                    <div className="flex flex-row items-center justify-start gap-2">
                      <img src={getAssetLogo(ft.id)} className="w-6 h-6" alt="info-icon" />
                      <div className="flex items-center justify-center px-1 rounded-md bg-slate-500">
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
      const auxSymbols = assetFilter.filter((currentAsset) => currentAsset !== asset.tokenSymbol);
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
}

const assetStyle = (k: number, assets: Asset[]) =>
  clsx({
    ["flex flex-row justify-between items-center px-3 py-2 w-full hover:bg-HoverColorLight hover:dark:bg-HoverColor"]:
      true,
    ["rounded-b-lg"]: k === assets.length - 1,
  });
