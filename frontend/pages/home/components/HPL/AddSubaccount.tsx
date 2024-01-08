// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
//
import { CustomInput } from "@components/Input";
import { useHPL } from "@pages/hooks/hplHook";
import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { HPLAsset } from "@redux/models/AccountModels";
import { CustomButton } from "@components/Button";
import LoadingLoader from "@components/Loader";
import { AccountHook } from "@pages/hooks/accountHook";
import AssetSymbol from "@components/AssetSymbol";

interface AddSubaccountProps {
  setAssetOpen(value: boolean): void;
  open: boolean;
  extAsset?: HPLAsset;
}

const AddSubaccount = ({ setAssetOpen, open, extAsset }: AddSubaccountProps) => {
  const { t } = useTranslation();
  const { authClient } = AccountHook();
  const {
    ingressActor,
    hplFTs,
    selAsset,
    setSelAsset,
    selAssetOpen,
    setSelAssetOpen,
    selAssetSearch,
    setSelAssetSearch,
    newHplSub,
    setNewHplSub,
    addSubErr,
    setAddSubErr,
    getAssetLogo,
    hplSubsData,
    addSub,
    nHpl,
  } = useHPL(open);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(false);
    if (extAsset) {
      setSelAsset(extAsset);
    }
  }, [open]);

  return (
    <Fragment>
      <div className="flex flex-col justify-start items-center bg-PrimaryColorLight dark:bg-PrimaryColor w-full h-full pt-8 px-6 text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
        <div className="flex flex-row justify-between items-center w-full mb-3">
          <p className="text-lg font-bold">{t("add.subaccount")}</p>
          <CloseIcon
            className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
            onClick={onClose}
          />
        </div>
        <p className="w-full text-left mt-2">{`${t("adding.account")}: ${nHpl.nAccounts}`}</p>
        <div className="flex flex-col items-start w-full mt-3 mb-3">
          <p className="opacity-60">
            {t("account.name")}
            <span className="ml-1 text-RadioCheckColor">*</span>
          </p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={newHplSub.name}
            onChange={onNameChange}
          />
        </div>
        <div className="flex flex-col justify-between items-center w-full mb-3">
          <p className="w-full text-left opacity-60">
            {t("asset")} <span className="text-RadioCheckColor">*</span>
          </p>
          <DropdownMenu.Root
            open={selAssetOpen}
            onOpenChange={(e: boolean) => {
              setSelAssetOpen(e);
            }}
          >
            <DropdownMenu.Trigger asChild>
              <div
                className={clsx(
                  "flex justify-start items-start",
                  "border-BorderColorLight dark:border-BorderColor",
                  "cursor-pointer",
                  "!w-full",
                  "pr-0",
                )}
              >
                <div className="flex flex-row justify-start items-center w-full p-2 border border-BorderColorLight dark:border-BorderColor rounded-md">
                  {!selAsset ? (
                    <div className="flex flex-row justify-between items-center w-full">
                      <p className="opacity-60">{t("select.asset")}</p>
                      <img
                        src={ChevIcon}
                        style={{ width: "2rem", height: "2rem" }}
                        alt="chevron-icon"
                        className={`${selAssetOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className=" flex flex-row justify-start items-center w-full gap-2 text-sm">
                        <img src={getAssetLogo(selAsset.id)} className="w-8 h-8" alt="info-icon" />
                        <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                          <p className=" text-PrimaryTextColor">{selAsset.id.toString()}</p>
                        </div>
                        <p>
                          {`${selAsset.name !== "" ? selAsset.name : ""}${
                            selAsset.name !== "" && selAsset.symbol !== "" ? " / " : ""
                          }${selAsset.symbol !== "" ? selAsset.symbol : ""}`}
                        </p>
                      </div>
                      <img
                        src={ChevIcon}
                        style={{ width: "2rem", height: "2rem" }}
                        alt="chevron-icon"
                        className={`${selAssetOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="text-lg bg-PrimaryColorLight w-[25rem] rounded-lg dark:bg-SecondaryColor z-[2000] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-SelectRowColor"
                sideOffset={5}
                align="end"
              >
                <div className="flex flex-col justify-start items-start w-full  gap-2">
                  <CustomInput
                    prefix={<img src={SearchIcon} className="h-[15px] w-[15px]" alt="search-icon" />}
                    sizeInput={"small"}
                    intent={"secondary"}
                    className="m-1"
                    placeholder=""
                    compOutClass=""
                    value={selAssetSearch}
                    onChange={onSearchChange}
                  />
                  <div className="flex flex-col justify-start items-start w-full scroll-y-light max-h-[calc(100vh-30rem)]">
                    {hplFTs
                      .filter((ft) => {
                        const key = selAssetSearch.toLowerCase();
                        return (
                          ft.name.toLowerCase().includes(key) ||
                          ft.symbol.toLowerCase().includes(key) ||
                          ft.id.toString().includes(key)
                        );
                      })
                      .map((ft, k) => {
                        return (
                          <button
                            key={k}
                            className="flex flex-row justify-start items-center w-full gap-2 text-sm hover:bg-HoverColorLight dark:hover:bg-SelectRowColorLight"
                            onClick={() => {
                              onSelectAsset(ft);
                            }}
                          >
                            <img src={getAssetLogo(ft.id)} className="w-8 h-8" alt="info-icon" />
                            <AssetSymbol ft={ft} />
                          </button>
                        );
                      })}
                  </div>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <p className="text-TextErrorColor text-sm">{addSubErr != "" ? addSubErr : ""}</p>
          <CustomButton className="min-w-[5rem]" onClick={onAdd} size={"small"}>
            {loading ? <LoadingLoader className="mt-1" /> : <p>{t("add")}</p>}
          </CustomButton>
        </div>
      </div>
    </Fragment>
  );

  function onClose() {
    setAssetOpen(false);
  }

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setNewHplSub((prev: any) => {
      return { ...prev, name: e.target.value };
    });
  }

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSelAssetSearch(e.target.value);
  }

  function onSelectAsset(ft: HPLAsset) {
    setSelAsset(ft);
    setSelAssetOpen(false);
  }

  async function onAdd() {
    if (!loading) {
      setLoading(true);
      if (selAsset && newHplSub.name.trim() !== "") {
        try {
          const res: { ok: { first: bigint } } = (await ingressActor.openAccounts(BigInt(1), {
            ft: BigInt(selAsset.id),
          })) as any;
          const newS = { id: res.ok.first.toString(), name: newHplSub.name.trim(), ftId: selAsset.id };
          addSub(newS);
          const auxSubs = [...hplSubsData, newS];
          localStorage.setItem(
            "hplSUB-" + authClient,
            JSON.stringify({
              sub: auxSubs,
            }),
          );
          onClose();
          setLoading(false);
        } catch (e) {
          setAddSubErr("server.error");
          setLoading(false);
        }
      } else {
        setAddSubErr(t("check.mandatory.fields"));
        setLoading(false);
      }
    }
  }
};

export default AddSubaccount;
