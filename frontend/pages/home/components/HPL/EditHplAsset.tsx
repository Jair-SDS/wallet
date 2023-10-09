// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/Input";
import { useHPL } from "@pages/hooks/hplHook";
import { ChangeEvent, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/Button";
import { HPLAsset } from "@redux/models/AccountModels";

interface EditHplAssetProps {
  setAssetOpen(value: boolean): void;
  open: boolean;
  setEditedFt(value: HPLAsset | undefined): void;
  editedFt: HPLAsset;
}

const EditHplAsset = ({ setAssetOpen, open, setEditedFt, editedFt }: EditHplAssetProps) => {
  const { t } = useTranslation();
  const { ingressActor, selAsset, newHplSub, setNewHplSub, addSubErr, setAddSubErr, reloadHPLBallance } = useHPL(open);
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
          <p>LOGO</p>
          <p className="font-semibold">{`${editedFt?.token_name} - ${editedFt?.token_symbol}`}</p>
        </div>
        <div className="flex flex-col items-start w-full mt-3 mb-3">
          <p className="opacity-60">{t("asset.name")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={newHplSub.name}
            onChange={onNameChange}
          />
          <p className="opacity-60 mt-4">{t("asset.symbol")}</p>
          <CustomInput
            sizeInput={"medium"}
            intent={"secondary"}
            placeholder=""
            compOutClass=""
            value={newHplSub.name}
            onChange={onNameChange}
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
    setNewHplSub((prev: any) => {
      return { ...prev, name: e.target.value };
    });
  }

  async function onAdd() {
    if (selAsset && newHplSub.name.trim() !== "")
      try {
        const res = (await ingressActor.openAccounts(BigInt(1), { ft: selAsset.id })) as any;
        console.log(res);

        if (res.err) {
          if (res.err.InvalidArguments) setAddSubErr("InvalidArguments");
          else if (res.err.NoSpaceForPrincipal === null) setAddSubErr("NoSpaceForPrincipal");
          else setAddSubErr("NoSpaceForSubaccount");
        } else {
          reloadHPLBallance();
          onClose();
        }
      } catch (e) {
        setAddSubErr("Server Error");
      }
    else setAddSubErr("Check mandatory fields");
  }
};

export default EditHplAsset;
