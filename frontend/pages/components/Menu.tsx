import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/Button";
import { AssetHook } from "@pages/home/hooks/assetHook";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { setRoutingPath } from "@redux/auth/AuthReducer";
import { ProtocolTypeEnum, RoutingPath, RoutingPathEnum } from "@/const";
import { useHplContacts } from "@pages/contacts/hooks/hplContactsHook";

const Menu = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { route } = useAppSelector((state) => state.auth);
  const { assets, subaccounts, protocol, hplFTsData, ftsUsed } = AssetHook();
  const { hplContacts, contacts } = useHplContacts();

  const menuList = [
    {
      name: "HPLAssets",
      path: RoutingPathEnum.Enum.ASSETS,
      label: `${hplFTsData?.length !== 1 ? t("assets") : t("asset")} (${ftsUsed}/${hplFTsData?.length})`,
      show: protocol === ProtocolTypeEnum.Enum.HPL,
    },
    {
      name: "Assets",
      path: RoutingPathEnum.Enum.HOME,
      label:
        protocol === ProtocolTypeEnum.Enum.ICRC1
          ? `${assets?.length !== 1 ? t("assets") : t("asset")} (${assets?.length})`
          : `${subaccounts?.length !== 1 ? t("accounts") : t("account")} (${subaccounts?.length})`,
      show: true,
    },
    {
      name: "Contacts",
      path: RoutingPathEnum.Enum.CONTACTS,
      label:
        protocol === ProtocolTypeEnum.Enum.ICRC1
          ? `${assets?.length !== 1 ? t("contacts") : t("contact")} (${contacts?.length})`
          : `${hplContacts?.length !== 1 ? t("contacts") : t("contact")} (${hplContacts?.length})`,
      show: true,
    },
  ];

  return (
    <Fragment>
      <div className="flex flex-row gap-3 justify-start items-center w-full pl-3">
        {menuList.map(
          (menu, k) =>
            menu.show && (
              <CustomButton
                key={k}
                size={"small"}
                intent={"noBG"}
                border={"underline"}
                className="flex flex-row justify-start items-center mb-4"
                onClick={() => {
                  handleMenuClic(menu.path);
                }}
              >
                <p
                  className={`!font-normal  mr-2 ${
                    route !== menu.path
                      ? " text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60"
                      : "border-b border-SelectRowColor"
                  }`}
                >
                  {menu.label}
                </p>
              </CustomButton>
            ),
        )}
      </div>
    </Fragment>
  );

  function handleMenuClic(path: RoutingPath) {
    dispatch(setRoutingPath(path));
  }
};

export default Menu;
