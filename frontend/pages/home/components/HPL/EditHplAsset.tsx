// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/Input";
import { useHPL } from "@pages/hooks/hplHook";
import { ChangeEvent, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/Button";
import { HPLAsset, HPLAssetData } from "@redux/models/AccountModels";
import { AccountHook } from "@pages/hooks/accountHook";

interface EditHplAssetProps {
  setAssetOpen(value: boolean): void;
  open: boolean;
  setEditedFt(value: HPLAsset | undefined): void;
  editedFt: HPLAsset;
}

const EditHplAsset = ({ setAssetOpen, open, setEditedFt, editedFt }: EditHplAssetProps) => {
  const { t } = useTranslation();
  const { authClient } = AccountHook();
  const { addSubErr, editSelAsset, hplFTsData, getAssetLogo } = useHPL(open);
  return (
    <Fragment>
      <div className="flex flex-col justify-start items-center bg-PrimaryColorLight dark:bg-PrimaryColor w-full h-full pt-8 px-6 text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
        <div className="flex flex-row justify-between items-center w-full mb-3">
          <p className="text-lg font-bold">{t("edit.ft")}</p>
          <CloseIcon
            className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full my-3 gap-1">
          <img src={getAssetLogo(editedFt.id)} className="w-8 h-8" alt="info-icon" />
          <p className="font-semibold">{`${
            (editedFt?.token_name + " - " + editedFt?.token_symbol).trim() === "-"
              ? ""
              : editedFt?.token_name + " - " + editedFt?.token_symbol
          }`}</p>
        </div>
        <div className="flex flex-col items-start w-full mt-3 mb-3">
          <p className="opacity-60">{t("asset.name")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={editedFt.name}
            onChange={onNameChange}
          />
          <p className="opacity-60 mt-4">{t("asset.symbol")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={editedFt.symbol}
            onChange={onSymbolChange}
          />
        </div>
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <p className="text-TextErrorColor text-sm">{addSubErr != "" ? addSubErr : ""}</p>
          <CustomButton className="min-w-[5rem]" onClick={onAdd}>
            <p>{t("save")}</p>
          </CustomButton>
        </div>
      </div>
    </Fragment>
  );

  function onClose() {
    setAssetOpen(false);
    setEditedFt(undefined);
  }

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length < 65 && e.target.value.length >= 0) setEditedFt({ ...editedFt, name: e.target.value });
  }

  function onSymbolChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length < 9 && e.target.value.length >= 0) setEditedFt({ ...editedFt, symbol: e.target.value });
  }

  async function onAdd() {
    const auxFt = hplFTsData.find((ft) => ft.id === editedFt.id);
    let auxFtsdata: HPLAssetData[] = [];
    if (auxFt) {
      hplFTsData.map((ft) => {
        if (ft.id === editedFt.id) {
          auxFtsdata.push({ id: ft.id, name: editedFt.name.trim(), symbol: editedFt.symbol.trim() });
        } else auxFtsdata.push(ft);
      });
    } else {
      auxFtsdata = [
        ...hplFTsData,
        {
          id: editedFt.id,
          name: editedFt.name.trim(),
          symbol: editedFt.symbol.trim(),
        },
      ];
    }
    localStorage.setItem(
      "hplFT-" + authClient,
      JSON.stringify({
        ft: auxFtsdata,
      }),
    );
    editSelAsset(editedFt, auxFtsdata);
    onClose();
  }
};

export default EditHplAsset;
