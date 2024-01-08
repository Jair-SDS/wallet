// svgs
import PlusIcon from "@assets/svg/files/plus-icon.svg";
//
import { getDecimalAmount, getDisplayNameFromFt, shortPrincipals } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import { HPLAsset } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import AssetSymbol from "@components/AssetSymbol";
import CustomHoverCard from "@components/HoverCard";
import { CustomCopy } from "@components/CopyTooltip";

interface AssetListTableProps {
  assets: HPLAsset[];
  subsInAsset: { id: string; accounts: number }[];
  setAssetOpen(value: boolean): void;
  selAsset?: HPLAsset;
  setSelAsset(value: HPLAsset | undefined): void;
}

const AssetListTable = ({ assets, subsInAsset, setAssetOpen, selAsset, setSelAsset }: AssetListTableProps) => {
  const { t } = useTranslation();
  const { getAssetLogo } = useHPL(false);

  return (
    <div className="flex flex-col w-full h-full mt-3 scroll-y-light max-h-[calc(100vh-15rem)]">
      <table className="w-full  text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 text-md">
        <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo sticky top-0 z-[1]">
          <tr>
            <th className="p-2 w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor  font-normal">
              <p>{t("logo")}</p>
            </th>
            <th className="p-2 text-left w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("symbol")}</p>
            </th>
            <th className="p-2 w-[18%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("name")}</p>
            </th>
            <th className="p-2 w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{"ID"}</p>
            </th>
            <th className="p-2 w-[25%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("controller")}</p>
            </th>
            <th className="p-2 w-[18%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("supply")}</p>
            </th>
            <th className="p-2 w-[15%] bg-PrimaryColorLight dark:bg-PrimaryColor font-normal">
              <p>{t("accounts")}</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((ft, k) => {
            const find = subsInAsset.find((sub) => sub.id === ft.id);
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
                    <img src={getAssetLogo(ft.id)} className="w-8 h-8" alt="info-icon" />
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full">
                    {ft.description ? (
                      <CustomHoverCard
                        arrowFill="fill-SelectRowColor"
                        trigger={
                          <AssetSymbol
                            ft={ft}
                            textClass="text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 font-normal"
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
                      />
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full">
                    <p>{getDisplayNameFromFt(ft)}</p>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-center items-center w-full">
                    <div className="flex flex-row justify-center items-center px-2 rounded bg-AssetSymbol/20 border border-AssetSymbol">
                      <p className=" text-PrimaryTextColor">{ft.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full gap-2">
                    <p className="text-left">
                      {ft.controller.split("-").length > 4 ? shortPrincipals(ft.controller, 2, 2) : ft.controller}
                    </p>
                    <CustomCopy size={"small"} copyText={ft.controller} className="opacity-60" />
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full">
                    <p>{getDecimalAmount(ft.supply, ft.decimal)}</p>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-center items-center w-full">
                    <div
                      className={"flex flex-row justify-between items-center h-8 rounded bg-black/10 dark:bg-white/10"}
                    >
                      <div className="flex flex-row justify-center items-center w-14">
                        <p>{find ? find.accounts : 0}</p>
                      </div>
                      <button
                        className="flex justify-center items-center p-0 h-full bg-AccpetButtonColor rounded-md w-8"
                        onClick={() => {
                          onAddAccount(ft);
                        }}
                      >
                        <img src={PlusIcon} alt="plus-icon" />
                      </button>
                    </div>
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
};

export default AssetListTable;
