// svgs
import { DeleteContactTypeEnum } from "@/const";
import { getDisplayNameFromFt } from "@/utils";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import AssetSymbol from "@components/AssetSymbol";
//
import { useHPL } from "@pages/hooks/hplHook";
import { HplContact, HplRemote } from "@redux/models/AccountModels";
import { NewContactSubAccount } from "@redux/models/ContactsModels";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface TableRemotesProps {
  cntc: HplContact;
  setDeleteHpl(value: boolean): void;
  setDeleteModal(value: boolean): void;
  setDeleteObject(value: NewContactSubAccount): void;
  setDeleteType(value: DeleteContactTypeEnum): void;
}

const TableRemotes = ({ cntc, setDeleteHpl, setDeleteModal, setDeleteObject, setDeleteType }: TableRemotesProps) => {
  const { t } = useTranslation();
  const { getAssetLogo, getFtFromSub } = useHPL(false);
  return (
    <table className="w-full text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md ">
      {cntc.remotes.length > 0 && (
        <thead>
          <tr className=" font-normal text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60">
            <th className="p-2 w-[5%]"></th>
            <th className="p-2 text-center w-[7%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
              <p>{t("code")}</p>
            </th>
            <th className="p-2 w-[31%] text-left border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
              <p>{t("name")}</p>
            </th>
            <th className="p-2 w-[12%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
              <p>{t("asset")} ID</p>
            </th>
            <th className="w-[30%] text-left border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
              <p>{t("asset.name")}</p>
            </th>
            <th className="w-[12%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo"></th>
            <th className="w-[3%] border-b border-BorderColorTwoLight dark:border-BorderColorTwo"></th>
          </tr>
        </thead>
      )}
      <tbody>
        {cntc.remotes.map((rmt, j) => {
          const ft = getFtFromSub(rmt.ftIndex);
          const expired = rmt.expired === 0 ? false : dayjs(rmt.expired).isBefore(dayjs());
          const bg = rmt.status === "deleted" ? "bg-[#B0736F]" : expired ? "bg-[#7C7C7C]" : "";
          return (
            <tr key={j}>
              <td className="h-14">
                <div className="relative flex flex-col justify-center items-center w-full h-full">
                  <div className="relative flex flex-col justify-center items-center w-full h-full">
                    <div className="w-1 h-1 bg-SelectRowColor"></div>
                    {j !== 0 && (
                      <div className="absolute bottom-1/2 w-1 ml-[-1px] left-1/2 border-l h-full border-dotted border-SelectRowColor"></div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-0 h-full border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
                <div className="relative flex flex-row justify-center items-center w-full h-full">
                  <div className={`absolute left-0 w-1 h-10 rounded-full ${bg}`}></div>
                  <p>{rmt.code}</p>
                </div>
              </td>
              <td className="p-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
                <div className="flex flex-row justify-start items-center w-full">
                  <p>{rmt.name}</p>
                </div>
              </td>
              <td className="py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
                <div className="flex flex-row justify-center items-center gap-4 w-full">
                  <img src={getAssetLogo(rmt.ftIndex)} className="w-5 h-5" alt="info-icon" />
                  <div className="flex justify-center items-center  px-1 bg-slate-500 rounded-md">
                    <p className="text-md text-PrimaryTextColor">{rmt.ftIndex}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 px-1 border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
                <div className="flex flex-row justify-start items-center gap-2 w-full">
                  <AssetSymbol ft={ft} sufix={<p>{`${getDisplayNameFromFt(ft, t)} /`}</p>} />
                </div>
              </td>
              <td className="py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo">
                <div className="flex flex-row justify-center items-center gap-2 w-full">
                  <TrashIcon
                    onClick={() => {
                      onDeleteAsset(rmt);
                    }}
                    className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor cursor-pointer"
                  />
                </div>
              </td>
              <td className="py-2 border-b border-BorderColorTwoLight dark:border-BorderColorTwo"></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  function onDeleteAsset(rmt: HplRemote) {
    setDeleteType(DeleteContactTypeEnum.Enum.SUB);
    setDeleteObject({
      principal: cntc.principal,
      name: cntc.name,
      tokenSymbol: "",
      symbol: "",
      subaccIdx: rmt.index,
      subaccName: rmt.name,
      totalAssets: 0,
      TotalSub: 0,
    });
    setDeleteHpl(true);
    setDeleteModal(true);
  }
};

export default TableRemotes;
