// svgs
import PlusIcon from "@assets/svg/files/plus-icon.svg"; // svgs
import { ReactComponent as VerifiedIcon } from "@assets/svg/files/verified-icon.svg";
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as RefreshIcon } from "@/assets/svg/files/refresh-ccw.svg";
//
import { getDecimalAmount, getDisplayNameFromFt, shortPrincipals } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import { HPLAsset } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import AssetSymbol from "@components/AssetSymbol";
import CustomHoverCard from "@components/HoverCard";
import { CustomCopy } from "@components/tooltip";
import { FungibleTokenLocal } from "@redux/models/TokenModels";
import { useState } from "react";
import { AssetHook } from "@pages/home/hooks/assetHook";

interface AssetListTableProps {
  assets: HPLAsset[];
  subsInAsset: { id: string; accounts: number }[];
  vtsInAsset: { id: string; vts: number }[];
  setAssetOpen(value: boolean): void;
  selAsset?: HPLAsset;
  setSelAsset(value: HPLAsset | undefined): void;
  setEditView(value: boolean): void;
  getContactName(principal: string): string;
  dictionaryHplFTs: FungibleTokenLocal[];
}

const AssetListTable = ({
  assets,
  subsInAsset,
  vtsInAsset,
  setAssetOpen,
  selAsset,
  setSelAsset,
  setEditView,
  getContactName,
  dictionaryHplFTs,
}: AssetListTableProps) => {
  const { t } = useTranslation();
  const { reloadDictFts } = AssetHook();
  const { getAssetLogo, hplDictionary } = useHPL(false);
  const [dictLoading, setDictLoading] = useState(false);

  const rightBorderStyle = "border-r-[2px] border-BorderColorTwoLight dark:border-BorderColorTwo";

  return (
    <div className="flex flex-col w-full h-full mt-3 scroll-y-light max-h-[calc(100vh-15rem)]">
      <table className="w-full  text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 text-md">
        <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo sticky top-0 z-[1]">
          <tr className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
            <th className="bg-PrimaryColorLight dark:bg-PrimaryColor" colSpan={5}>
              Ledger
            </th>
            <th className="bg-PrimaryColorLight dark:bg-PrimaryColor" colSpan={4}>
              <div className="flex flex-row justify-center items-center gap-2">
                <p>{t("directory")}</p>
                <RefreshIcon
                  className={`h-3 w-3 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor ${
                    dictLoading ? "do-spin" : ""
                  }`}
                  onClick={handleReloadButton}
                />
              </div>
            </th>
            <th className="bg-PrimaryColorLight dark:bg-PrimaryColor" colSpan={2}>
              {t("wallet")}
            </th>
          </tr>
          <tr>
            <th className="p-0.5 py-2 w-[4%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{"ID"}</p>
            </th>
            <th className="p-0.5 py-2 w-[19%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("controller")}</p>
            </th>
            <th className="p-0.5 py-2 w-[13%] text-right bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("supply")}</p>
            </th>
            <th className="p-0.5 py-2 w-[12%] text-right bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("ledger.balance")}</p>
            </th>
            <th
              className={`pl-0.5 pr-2 py-2 w-[8%] text-right bg-PrimaryColorLight dark:bg-PrimaryColor font-normal ${rightBorderStyle}`}
            >
              <p>{t("decimals")}</p>
            </th>
            <th className="p-0.5 py-2 w-[5%] bg-PrimaryColorLight dark:bg-PrimaryColor  font-normal">
              <p>{t("logo")}</p>
            </th>
            <th className="p-0.5 py-2 text-left w-[6%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("symbol")}</p>
            </th>
            <th className="p-0.5 py-2 w-[14%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("name")}</p>
            </th>
            <th
              className={`p-0.5 py-2 w-[5%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal ${rightBorderStyle}`}
            ></th>
            <th className="p-0.5 py-2 w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("accounts")}</p>
            </th>
            <th className="p-0.5 py-2 w-[4%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("remotes")}</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((ft, k) => {
            const find = subsInAsset.find((sub) => sub.id === ft.id);
            const findVts = vtsInAsset.find((vt) => vt.id === ft.id);
            const contactName = getContactName(ft.controller);
            const noLogo = ft.name !== "" || ft.symbol !== "" || ft.logo === "";
            const inDict = dictionaryHplFTs.find((dict) => dict.assetId === ft.id);
            const verified = inDict && ft.name === "" && ft.symbol === "";
            const inDictEdited = inDict && (ft.name !== "" || ft.symbol !== "");

            return (
              <tr
                key={k}
                className={`border-b border-BorderColorTwoLight dark:border-BorderColorTwo font-normal ${
                  selAsset?.id === ft.id ? "bg-SelectRowColor/20" : ""
                }`}
              >
                <td className="p-0 h-14">
                  <div className="relative flex flex-row justify-center items-center w-full">
                    {selAsset?.id === ft.id && <div className="absolute left-0 w-1 h-14 bg-SelectRowColor"></div>}
                    <div className="flex flex-row justify-center items-center px-2 rounded bg-AssetSymbol/20 border border-AssetSymbol">
                      <p className=" text-PrimaryTextColorLight dark:text-PrimaryTextColor">{ft.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-col justify-start items-start w-full gap-2">
                    {contactName ? (
                      <CustomHoverCard arrowFill="fill-SelectRowColor" side="right" trigger={<p>{contactName}</p>}>
                        <div className="flex flex-row justify-center items-center max-w-xl p-2 bg-PrimaryColorLight dark:bg-PrimaryColor border border-SelectRowColor rounded gap-2">
                          <p className="text-left text-sm">
                            {ft.controller.split("-").length > 4
                              ? shortPrincipals(ft.controller, 2, 2, "", "", 6)
                              : ft.controller}
                          </p>
                          <CustomCopy size={"small"} copyText={ft.controller} className="opacity-60" />
                        </div>
                      </CustomHoverCard>
                    ) : (
                      <div className="flex flex-row justify-start items-center w-full gap-2">
                        <p className="text-left">
                          {ft.controller.split("-").length > 4
                            ? shortPrincipals(ft.controller, 2, 2, "", "", 6)
                            : ft.controller}
                        </p>
                        <CustomCopy size={"small"} copyText={ft.controller} className="opacity-60" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-row justify-end items-center w-full">
                    <p>{getDecimalAmount(ft.supply, ft.decimal)}</p>
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-row justify-end items-center w-full">
                    <p>{getDecimalAmount(ft.ledgerBalance, ft.decimal)}</p>
                  </div>
                </td>
                <td className={`pl-0.5 pr-2 ${rightBorderStyle}`}>
                  <div className="flex flex-row justify-end items-center w-full">
                    <p>{ft.decimal}</p>
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="relative flex flex-row justify-center items-center w-full">
                    {!noLogo && <img src={getAssetLogo(ft.id)} className="w-8 h-8" alt="info-icon" />}
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-row justify-start items-center w-full">
                    {ft.description ? (
                      <CustomHoverCard
                        arrowFill="fill-SelectRowColor"
                        trigger={
                          <AssetSymbol
                            ft={ft}
                            textClass="text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 font-normal"
                            emptyFormat
                          />
                        }
                      >
                        <div className="flex flex-col justify-center items-center max-w-xl bg-PrimaryColorLight dark:bg-PrimaryColor border border-SelectRowColor rounded">
                          <div className="flex justify-center items-center w-full h-full bg-SelectRowColor/20 p-1">
                            <p className="text-sm text-PrimaryTextColorLight dark:text-PrimaryTextColor">
                              {ft.description}
                            </p>
                          </div>
                        </div>
                      </CustomHoverCard>
                    ) : (
                      <AssetSymbol
                        ft={ft}
                        textClass="text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70  font-normal"
                        emptyFormat
                      />
                    )}
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-row justify-start items-center w-full">
                    <p className="text-left">{getDisplayNameFromFt(ft, t, true)}</p>
                  </div>
                </td>
                <td className={`p-0.5 ${rightBorderStyle}`}>
                  <div className="flex flex-row justify-end items-center w-full gap-2">
                    {verified && <VerifiedIcon className="w-4 h-4 fill-SelectRowColor" />}
                    {inDictEdited && <VerifiedIcon className="w-4 h-4 fill-gray-500 " />}
                    <PencilIcon
                      onClick={() => {
                        onEdit(ft);
                      }}
                      className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor opacity-50 cursor-pointer"
                    />
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-row justify-center items-center w-full">
                    <div
                      className={"flex flex-row justify-between items-center h-6 rounded bg-black/10 dark:bg-white/10"}
                    >
                      <div className="flex flex-row justify-center items-center w-10">
                        <p>{find ? find.accounts : 0}</p>
                      </div>
                      <button
                        className="flex justify-center items-center p-0 h-full bg-AccpetButtonColor rounded-md w-6"
                        onClick={() => {
                          onAddAccount(ft);
                        }}
                      >
                        <img src={PlusIcon} alt="plus-icon" className="w-4" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-0.5">
                  <div className="flex flex-row justify-center items-center w-full">
                    <p className="text-left">{findVts ? findVts.vts : 0}</p>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  function onAddAccount(ft: HPLAsset) {
    setSelAsset(ft);
    setAssetOpen(true);
  }

  function onEdit(ft: HPLAsset) {
    setEditView(true);
    setSelAsset(ft);
    setAssetOpen(true);
  }

  async function handleReloadButton() {
    setDictLoading(true);
    await reloadDictFts(hplDictionary);
    setDictLoading(false);
  }
};

export default AssetListTable;
