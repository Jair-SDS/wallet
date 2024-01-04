// svgs
import PlusIcon from "@assets/svg/files/plus-icon.svg";
//
import { getDisplayNameFromFt, shortAddress } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import { HPLAsset } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import AssetSymbol from "@components/AssetSymbol";

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
      <table className="w-full  text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
        <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo text-PrimaryTextColor/70 sticky top-0 z-[1]">
          <tr className="text-PrimaryTextColorLight dark:text-PrimaryTextColor">
            <th className="p-2 w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor ">
              <p>{t("logo")}</p>
            </th>
            <th className="p-2 text-left w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor">
              <p>{t("symbol")}</p>
            </th>
            <th className="p-2 w-[24%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor">
              <p>{t("name")}</p>
            </th>
            <th className="p-2 w-[8%] bg-PrimaryColorLight dark:bg-PrimaryColor">
              <p>{"ID"}</p>
            </th>
            <th className="p-2 w-[12%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor">
              <p>{t("controller")}</p>
            </th>
            <th className="p-2 w-[25%] text-left bg-PrimaryColorLight dark:bg-PrimaryColor">
              <p>{t("supply")}</p>
            </th>
            <th className="p-2 w-[15%] bg-PrimaryColorLight dark:bg-PrimaryColor">
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
                className={`border-b border-BorderColorTwoLight dark:border-BorderColorTwo ${
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
                    <AssetSymbol ft={ft} />
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full">
                    <p>{getDisplayNameFromFt(ft)}</p>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-center items-center w-full">
                    <div className="flex flex-row justify-center items-center px-2 rounded bg-BorderColorTwoLight">
                      <p className=" text-PrimaryTextColor">{ft.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full">
                    <p>{shortAddress(ft.controller, 5, 4)}</p>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex flex-row justify-start items-center w-full">
                    <p>{ft.supply}</p>
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
