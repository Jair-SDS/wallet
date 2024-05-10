// svgs
import { ReactComponent as DropIcon } from "@assets/svg/files/chevron-right-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import { ReactComponent as PlusIcon } from "@assets/svg/files/plus.svg";
//
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useHPL } from "@pages/hooks/hplHook";
import { HPLAsset } from "@redux/models/AccountModels";
import { CustomCheck } from "@components/checkbox";
import { ChangeEvent, useEffect, useState } from "react";
import { CustomInput } from "@components/input";
import { useAppDispatch } from "@redux/Store";
import { setHPLSelectedVt } from "@redux/assets/AssetReducer";

interface AssetFilterProps {
  assetFilter: string[];
  setAssetFilter: (filter: string[]) => void;
  searchKey: string;
  setSearchKey: (value: string) => void;
  setDrawerOpen(value: boolean): void;
}

const ExchangeLinksFilters = (props: AssetFilterProps) => {
  const { assetFilter, setAssetFilter, searchKey, setSearchKey, setDrawerOpen } = props;
  const { getAssetLogo, getFtFromSub, hplFTs, subaccounts, exchangeLinks } = useHPL(false);
  const [fts, setFts] = useState<HPLAsset[]>([]);
  const [unicFt, setUnicFt] = useState<string>("");
  const [assetOpen, setAssetOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const backings = exchangeLinks.map((lnk) => {
      return lnk.backing;
    });

    const ids = subaccounts.map((sa) => {
      if (backings.includes(sa.sub_account_id)) return sa.ft;
    });
    const ftIds = hplFTs.filter((ft) => {
      return ids.includes(ft.id);
    });
    setFts(ftIds);
  }, [hplFTs, subaccounts, exchangeLinks]);

  useEffect(() => {
    if (assetFilter.length === 1) {
      const oneFt = getFtFromSub(assetFilter[0]);
      setUnicFt(
        `${oneFt?.symbol !== "" ? `[${oneFt?.symbol}]` : oneFt?.token_symbol !== "" ? `[${oneFt?.token_symbol}]` : ""}${
          oneFt?.name !== "" ? `[${oneFt?.name}]` : oneFt?.token_name !== "" ? `[${oneFt?.token_name}]` : ""
        }`.trim(),
      );
    }
  }, [assetFilter]);

  return (
    <div className="flex flex-row justify-start items-center gap-3">
      <div className="flex flex-row justify-start items-center gap-1">
        <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("assets")}</p>
        <DropdownMenu.Root
          onOpenChange={(e: boolean) => {
            setAssetOpen(e);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <div className="flex flex-row justify-start items-center border border-BorderColorLight dark:border-BorderColor rounded px-2 py-1 w-[14rem] h-[2.5rem] bg-SecondaryColorLight  dark:bg-SecondaryColor cursor-pointer">
              <div className="flex flex-row items-center justify-between w-full">
                {assetFilter.length === 0 || assetFilter.length === fts.length ? (
                  <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("all")}</p>
                ) : assetFilter.length === 1 ? (
                  <div className="flex flex-row items-center justify-start w-full gap-2 p-1 text-sm">
                    <img src={getAssetLogo(assetFilter[0])} className="w-6 h-6" alt="info-icon" />
                    {unicFt === "" ? (
                      <div className="flex items-center justify-center px-3 py-1 rounded-md bg-slate-500">
                        <p className=" text-PrimaryTextColor">{assetFilter[0]}</p>
                      </div>
                    ) : (
                      <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{unicFt}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">{`${assetFilter.length} ${t(
                    "selections",
                  )}`}</p>
                )}

                <DropIcon className={`fill-gray-color-4 ${assetOpen ? "-rotate-90" : ""}`} />
              </div>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="text-md bg-PrimaryColorLight w-[14rem] rounded-lg dark:bg-SecondaryColor scroll-y-light z-[2000] max-h-80 text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-BorderColorLight dark:border-BorderColor/20"
              sideOffset={2}
              align="end"
            >
              <div
                onClick={handleSelectAll}
                className="flex flex-row items-center justify-between w-full px-3 py-2 rounded-t-lg hover:bg-secondary-color-1-light hover:dark:bg-HoverColor"
              >
                <p>{t("selected.all")}</p>
                <CustomCheck
                  className="border-secondary-color-2-light dark:border-BorderColor"
                  checked={assetFilter.length === fts.length}
                />
              </div>
              {fts.map((ft, k) => {
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
                      <p>{`${ft.symbol !== "" ? ft.symbol : ft.token_symbol !== "" ? ft.token_symbol : ""}${
                        ft.name !== "" ? ` [${ft.name}]` : ft.token_name !== "" ? ` [${ft.token_name}]` : ""
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
      </div>
      <div>
        <CustomInput
          prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
          sizeInput={"small"}
          intent={"secondary"}
          placeholder=""
          compOutClass=""
          value={searchKey}
          onChange={onSearchChange}
        />
      </div>
      <div
        className={"rounded-md grid place-items-center bg-SelectRowColor w-8 h-8 cursor-pointer"}
        onClick={onAddLink}
      >
        <PlusIcon className="w-3 h-3 fill-white" />
      </div>
    </div>
  );

  function handleSelectAll() {
    let symbols: string[] = [];
    if (assetFilter.length === fts.length) setAssetFilter([]);
    else {
      symbols = fts.map((ft) => {
        return ft.id;
      });

      setAssetFilter(symbols);
    }
  }

  function handleSelectFt(ft: HPLAsset) {
    if (assetFilter.includes(ft.id)) {
      const auxSymbols = assetFilter.filter((ast) => ast !== ft.id);
      setAssetFilter(auxSymbols);
    } else setAssetFilter([...assetFilter, ft.id]);
  }

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function onAddLink() {
    dispatch(setHPLSelectedVt(undefined));
    setDrawerOpen(true);
  }
};

export default ExchangeLinksFilters;
