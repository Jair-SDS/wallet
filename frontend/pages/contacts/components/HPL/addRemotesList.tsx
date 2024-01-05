import { getDisplayNameFromFt } from "@/utils";
import AssetSymbol from "@components/AssetSymbol";
import { CustomCheck } from "@components/CheckBox";
import { CustomInput } from "@components/Input";
import { HPLAsset, HplRemote } from "@redux/models/AccountModels";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface AddRemoteListProps {
  chainRemotes: HplRemote[];
  setChainremotes(value: HplRemote[]): void;
  checkIds: string[];
  setCheckIds(value: string[]): void;
  getFtFromSub(value: string): HPLAsset;
  nameErrs: number[];
  getAssetLogo(value: string): string;
}

const AddRemoteList = ({
  chainRemotes,
  checkIds,
  setCheckIds,
  getFtFromSub,
  nameErrs,
  setChainremotes,
  getAssetLogo,
}: AddRemoteListProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row justify-start items-start w-full h-72 scroll-y-light rounded-sm bg-SecondaryColorLight dark:bg-ThirdColor gap-3">
      {chainRemotes.length > 0 ? (
        <table className="w-full text-md">
          <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo dark:text-PrimaryTextColor/70 text-PrimaryTextColorLight/70 sticky top-0 z-[1]">
            <tr>
              <th className="p-2 text-center w-[11%] bg-SecondaryColorLight dark:bg-ThirdColor">
                <p>{"ID"}</p>
              </th>
              <th className="p-2 text-left w-[35%] bg-SecondaryColorLight dark:bg-ThirdColor">
                <p>{t("name")}</p>
              </th>
              <th className="p-2 text-center w-[17%] bg-SecondaryColorLight dark:bg-ThirdColor">
                <p>{t("asset")} ID</p>
              </th>
              <th className="p-2 text-left w-[30%] bg-SecondaryColorLight dark:bg-ThirdColor">
                <p>{t("asset.name")}</p>
              </th>
              <th className="p-2 text-center w-[7%] bg-SecondaryColorLight dark:bg-ThirdColor">
                <div className="flex flex-row justify-center items-center">
                  <button className="flex flex-row justify-center items-center p-0" onClick={onAllCheck}>
                    <CustomCheck
                      className="border-BorderColorLight dark:border-BorderColor"
                      checked={checkIds.length === chainRemotes.length}
                    />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {chainRemotes.map((rmt, k) => {
              const ft = getFtFromSub(rmt.ftIndex);
              const checked = checkIds.includes(rmt.index);
              const expired = rmt.expired === 0 ? false : dayjs(rmt.expired).isBefore(dayjs());
              const bg = rmt.status === "deleted" ? "bg-[#B0736F]" : expired ? "bg-[#7C7C7C]" : "";
              return (
                <tr key={k} className={`${checked ? "bg-SelectRowColor/20" : ""}`}>
                  <td className="p-2 text-center">
                    <div className="relative flex flex-row justify-center items-center w-full">
                      <div className={`absolute left-0 w-2 h-full rounded-full ${bg}`}></div>
                      <p>{rmt.index}</p>
                    </div>
                  </td>
                  <td>
                    <CustomInput
                      key={k}
                      compOutClass="p-2"
                      inputClass="!py-1"
                      sizeInput={"medium"}
                      sizeComp={"small"}
                      intent={"primary"}
                      border={nameErrs.includes(k) ? "error" : undefined}
                      value={rmt.name}
                      onChange={(e) => {
                        onChangeRmtName(e.target.value, k);
                      }}
                    />
                  </td>
                  <td>
                    <div className="flex flex-row justify-center items-center gap-2">
                      <img src={getAssetLogo(rmt.ftIndex)} className="w-5 h-5" alt="info-icon" />
                      <div className="flex justify-center items-center  px-1 bg-slate-500 rounded-md">
                        <p className="text-md text-PrimaryTextColor">{rmt.ftIndex}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2">
                    <AssetSymbol ft={ft} compClass="!gap-1" sufix={<p>{`${getDisplayNameFromFt(ft, t)} /`}</p>} />
                  </td>
                  <td>
                    <div className="flex flex-row justify-center items-center">
                      <button
                        className="flex flex-row justify-center items-center p-0"
                        onClick={() => {
                          checkRemoteIds(rmt.index);
                        }}
                      >
                        <CustomCheck className="border-BorderColorLight dark:border-BorderColor" checked={checked} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div></div>
      )}
    </div>
  );
  function onAllCheck() {
    if (chainRemotes.length === checkIds.length) setCheckIds([]);
    else {
      setCheckIds(
        chainRemotes.map((rmt) => {
          return rmt.index;
        }),
      );
    }
  }
  function onChangeRmtName(name: string, k: number) {
    const auxRmts = chainRemotes.map((rmt, j) => {
      if (k === j) return { ...rmt, name: name };
      else return rmt;
    });
    setChainremotes(auxRmts);
  }
  function checkRemoteIds(index: string) {
    if (checkIds.includes(index)) {
      setCheckIds(
        checkIds.filter((id) => {
          return index !== id;
        }),
      );
    } else {
      setCheckIds([...checkIds, index]);
    }
  }
};

export default AddRemoteList;
