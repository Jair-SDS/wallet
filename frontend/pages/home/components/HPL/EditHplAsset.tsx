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
import { getDecimalAmount, shortAddress } from "@/utils";
import { CustomCopy } from "@components/CopyTooltip";
import AssetSymbol from "@components/AssetSymbol";

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
          <img src={getAssetLogo(editedFt.id)} className="w-10 h-10" alt="info-icon" />
          <AssetSymbol ft={editedFt} showBox />
          <p className="font-semibold">{`${
            (editedFt?.token_name + " - " + editedFt?.token_symbol).trim() === "-"
              ? ""
              : editedFt?.token_name + " - " + editedFt?.token_symbol
          }`}</p>
        </div>
        <div className="flex flex-col items-start w-full mt-3 mb-3">
          <p className="opacity-60">{t("name")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={editedFt.name}
            onChange={onNameChange}
          />
          <p className="opacity-60 mt-4">{t("symbol")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={editedFt.symbol}
            onChange={onSymbolChange}
          />
          <p className="opacity-60 mt-4">{t("controller")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            inputClass="opacity-60"
            value={shortAddress(editedFt.controller, 18, 10)}
            onChange={onSymbolChange}
            sufix={<CustomCopy className="opacity-70" copyText={editedFt.controller} />}
            disabled
          />
          <p className="opacity-60 mt-4">{t("supply")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            inputClass="opacity-60"
            value={getDecimalAmount(editedFt.supply, editedFt.decimal)}
            onChange={onSymbolChange}
            disabled
          />
          <p className="opacity-60 mt-4">{t("decimals")}</p>
          <CustomInput
            sizeInput={"medium"}
            compOutClass={"!w-1/2"}
            intent={"secondary"}
            placeholder=""
            inputClass="opacity-60"
            value={editedFt.decimal}
            onChange={onSymbolChange}
            disabled
          />
          <p className="opacity-60 mt-4">{t("asset.description")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            inputClass="opacity-60"
            value={editedFt.description}
            onChange={onSymbolChange}
            disabled
          />
        </div>
        <p className="text-TextErrorColor text-sm">{addSubErr != "" ? addSubErr : ""}</p>
        <div className="flex flex-row justify-end items-center w-full gap-2">
          <CustomButton
            intent={"neutral"}
            className="min-w-[5rem]"
            onClick={() => {
              onAdd(true);
            }}
          >
            <p>{t("use.dictionary")}</p>
          </CustomButton>
          <CustomButton
            className="min-w-[5rem]"
            onClick={() => {
              onAdd();
            }}
          >
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

  async function onAdd(useDict?: boolean) {
    const auxFt = hplFTsData.find((ft) => ft.id === editedFt.id);
    const auxFtsdata: HPLAssetData[] = [];
    if (auxFt) {
      hplFTsData.map((ft) => {
        if (ft.id === editedFt.id) {
          const auxFt = useDict
            ? { ...ft, name: "", symbol: "" }
            : { ...ft, name: editedFt.name.trim(), symbol: editedFt.symbol.trim() };
          auxFtsdata.push(auxFt);
        } else auxFtsdata.push(ft);
      });
    }
    if (auxFtsdata.length > 0) {
      localStorage.setItem(
        "hplFT-" + authClient,
        JSON.stringify({
          ft: auxFtsdata,
        }),
      );

      editSelAsset(useDict ? { ...editedFt, name: "", symbol: "" } : editedFt, auxFtsdata);
    }
    onClose();
  }
};

export default EditHplAsset;
