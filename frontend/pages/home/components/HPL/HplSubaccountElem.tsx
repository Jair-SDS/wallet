// svgs
import InfoIcon from "@assets/svg/files/info-icon.svg";
import PlusIcon from "@assets/svg/files/plus-icon.svg";
import CheckIcon from "@assets/svg/files/check.svg";
//
import { HPLAsset, HPLSubAccount, HPLSubData } from "@redux/models/AccountModels";
import { ChangeEvent, Fragment } from "react";
import { useHPL } from "@pages/hooks/hplHook";
import { CustomInput } from "@components/Input";
import { AccountHook } from "@pages/hooks/accountHook";
import { getDecimalAmount, getDisplayNameFromFt, getFirstNChars } from "@/utils";
import { useTranslation } from "react-i18next";
import AssetSymbol from "@components/AssetSymbol";

interface HplSubaccountElemProps {
  sub: HPLSubAccount;
  idx: number;
  editNameId: string;
  setEditedFt(value: HPLAsset | undefined): void;
  setAssetOpen(value: boolean): void;
  setEditNameId(value: string): void;
}

const HplSubaccountElem = ({
  sub,
  idx,
  editNameId,
  setEditedFt,
  setAssetOpen,
  setEditNameId,
}: HplSubaccountElemProps) => {
  const { authClient } = AccountHook();
  const {
    hplFTs,
    hplSubsData,
    subaccounts,
    selectSub,
    setSelSub,
    getFtFromSub,
    editSubName,
    setEditSubName,
    editSelSub,
    getAssetLogo,
  } = useHPL(false);
  const { t } = useTranslation();

  return (
    <Fragment>
      <button
        className={`relative flex flex-row items-center w-full min-h-[4rem] p-0 border-0 text-PrimaryColor dark:text-PrimaryColorLight cursor-pointer hover:bg-SecondaryColorLight dark:hover:bg-SecondaryColor ${
          sub.sub_account_id === selectSub?.sub_account_id ? "bg-SecondaryColorLight dark:bg-SecondaryColor" : ""
        } ${
          idx < subaccounts?.length ? "border-b-[0.1rem] dark:border-BorderColorThree border-BorderColorThreeLight" : ""
        }`}
        onClick={onSelectSub}
      >
        {sub.sub_account_id === selectSub?.sub_account_id && (
          <div className="absolute left-0 bg-[#33b2ef] h-full w-1"></div>
        )}
        <div className="flex flex-row justify-start w-full h-full text-md px-4">
          <div className="flex flex-row justify-start items-center gap-3 w-full">
            <img src={getAssetLogo(sub.ft)} className="w-8 h-8" alt="info-icon" />
            <div className="flex flex-col justify-start items-start text-md w-full gap-1">
              <div className="flex flex-row justify-start items-center w-full gap-2">
                <div className="flex justify-center items-center px-1 bg-slate-500 rounded">
                  <p className="text-PrimaryTextColor text-md leading-4">{sub.sub_account_id}</p>
                </div>
                {editNameId === sub.sub_account_id ? (
                  <div className="flex flex-row justify-start items-center w-full gap-2">
                    <CustomInput
                      intent={"primary"}
                      placeholder={""}
                      value={editSubName}
                      // border={nameError ? "error" : undefined}
                      sizeComp="small"
                      sizeInput="small"
                      inputClass="!py-1"
                      compOutClass="!w-full"
                      autoFocus
                      onChange={onNameChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSave();
                      }}
                    />
                    <div
                      className="flex justify-center items-center w-7 h-6 bg-RadioCheckColor rounded cursor-pointer"
                      onClick={onSave}
                    >
                      <img src={CheckIcon} className="w-3 h-3" alt="info-icon" />
                    </div>
                    <div
                      className="flex justify-center items-center w-7 h-6 bg-LockColor rounded cursor-pointer"
                      onClick={onCancel}
                    >
                      <img src={PlusIcon} className="w-6 h-6 rotate-45" alt="info-icon" />
                    </div>
                  </div>
                ) : (
                  <div className="p-0 w-full text-left " onDoubleClick={onDoubleClick}>
                    <p className="break-words">{`${sub.name != "" ? sub.name : "-"}`}</p>
                  </div>
                )}
                {editNameId != sub.sub_account_id && (
                  <p className=" whitespace-nowrap">{`${t("remotes")}: ${sub.virtuals.length}`}</p>
                )}
              </div>

              <div className="flex flex-row justify-between items-center w-full gap-2">
                <div className="flex flex-row justify-start items-center">
                  <p
                    className={`${
                      sub.sub_account_id !== selectSub?.sub_account_id ? "opacity-60" : ""
                    } text-left w-full break-words`}
                  >
                    {getFirstNChars(getDisplayNameFromFt(getFtFromSub(sub.ft), t), 18)}
                  </p>
                  <div className="p-0" onClick={setEditFt}>
                    <img src={InfoIcon} className="ml-1" alt="info-icon" />
                  </div>
                </div>
                <AssetSymbol
                  ft={getFtFromSub(sub.ft)}
                  textClass={`${sub.sub_account_id !== selectSub?.sub_account_id ? "opacity-60" : "font-semibold"}`}
                  sufix={
                    <p
                      className={`${sub.sub_account_id !== selectSub?.sub_account_id ? "opacity-60" : "font-semibold"}`}
                    >
                      {`${getDecimalAmount(sub.amount, getFtFromSub(sub.ft).decimal)}`}{" "}
                    </p>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </button>
    </Fragment>
  );

  function onSelectSub() {
    setSelSub(sub);
  }

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setEditSubName(e.target.value);
    // setNameError(false);
  }

  function onSave() {
    const auxSub = hplSubsData.find((sb) => sb.id === sub.sub_account_id);
    const auxSubData: HPLSubData[] = [];
    if (auxSub) {
      hplSubsData.map((sb) => {
        if (sb.id === sub.sub_account_id) {
          auxSubData.push({ ...sb, name: editSubName.trim() });
        } else auxSubData.push(sb);
      });
      localStorage.setItem(
        "hplSUB-" + authClient,
        JSON.stringify({
          sub: auxSubData,
        }),
      );
      editSelSub({ ...sub, name: editSubName.trim() }, auxSubData);
    }
    onCancel();
  }

  function onCancel() {
    setEditNameId("-1");
    setEditSubName("");
  }

  function onDoubleClick() {
    setEditSubName(sub.name);
    setEditNameId(sub.sub_account_id);
  }

  function setEditFt() {
    const ft = hplFTs.find((ft) => ft.id === sub.ft);
    setEditedFt(ft);
    setAssetOpen(true);
  }
};

export default HplSubaccountElem;
