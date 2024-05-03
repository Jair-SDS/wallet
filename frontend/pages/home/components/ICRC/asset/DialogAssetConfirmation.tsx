// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { BasicModal } from "@components/modal";
import { AddingAssetsEnum, TokenNetwork, IconTypeEnum, TokenNetworkEnum, AddingAssets } from "@/const";
import { useTranslation } from "react-i18next";
import { Asset } from "@redux/models/AccountModels";
import { getAssetIcon } from "@/utils/icons";
interface DialogAssetConfirmationProps {
  modal: boolean;
  showModal(value: boolean): void;
  newAsset: Asset;
  setNewAsset(value: Asset): void;
  setNetwork(value: TokenNetwork): void;
  addStatus: AddingAssets;
  setManual(value: boolean): void;
}

const DialogAssetConfirmation = ({
  modal,
  showModal,
  newAsset,
  setNewAsset,
  setNetwork,
  addStatus,
  setManual,
}: DialogAssetConfirmationProps) => {
  const { t } = useTranslation();

  return (
    <BasicModal
      open={modal}
      width="w-[18rem]"
      padding="py-3 px-1"
      border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
    >
      <div className="flex flex-col items-center justify-start w-full">
        <CloseIcon
          className="absolute cursor-pointer top-5 right-5 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={onClose}
        />
        <div className="flex flex-col items-center justify-start w-full py-2">
          {getAssetIcon(IconTypeEnum.Enum.ASSET, newAsset?.tokenSymbol, newAsset.logo)}
          <p
            className={`text-lg font-semibold mt-3 ${
              addStatus === AddingAssetsEnum.Enum.done ? "text-TextReceiveColor" : "text-TextSendColor"
            }`}
          >
            {getMessage(addStatus).top}
          </p>
          <p className="mt-3 text-lg font-semibold">{getMessage(addStatus).botton}</p>
        </div>
      </div>
    </BasicModal>
  );

  function onClose() {
    showModal(false);
    // TODO: it should now close the add update asset drawer
    // dispatch(setAssetMutationAction(AssetMutationAction.NONE));
    setNetwork(TokenNetworkEnum.enum["ICRC-1"]);
    setNewAsset({
      address: "",
      symbol: "",
      decimal: "",
      shortDecimal: "",
      name: "",
      tokenSymbol: "",
      tokenName: "",
      subAccounts: [
        {
          sub_account_id: "0x0",
          name: "Default",
          amount: "0",
          currency_amount: "0",
          address: "",
          symbol: "",
          decimal: 0,
          transaction_fee: "0",
        },
      ],
      index: "",
      sortIndex: 999,
      supportedStandards: [],
    });
    setManual(false);
  }

  function getMessage(status: string) {
    switch (status) {
      case AddingAssetsEnum.Enum.adding:
        return { top: "", botton: t("adding.asset") };
      case AddingAssetsEnum.Enum.done:
        return { top: t("congrats"), botton: t("adding.asset.successful") };
      case AddingAssetsEnum.Enum.error:
        return { top: t("error"), botton: t("adding.asset.failed") };

      default:
        return { top: t("adding.asset"), botton: "" };
    }
  }
};

export default DialogAssetConfirmation;
