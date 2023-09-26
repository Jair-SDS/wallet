import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@components/Button";
import history from "@pages/history";
import { CONTACTS, HOME } from "@pages/paths";
import { AssetHook } from "@pages/home/hooks/assetHook";
import { useContacts } from "@pages/contacts/hooks/contactsHook";
import { ProtocolTypeEnum } from "@/const";

const Menu = () => {
  const { t } = useTranslation();

  const { protocol, assets, subaccounts } = AssetHook();
  const { contacts } = useContacts();

  const menuList = [
    {
      name: "Assets",
      path: HOME,
      label: `${assets?.length !== 1 ? t("assets") : t("asset")} (${
        protocol === ProtocolTypeEnum.Enum.ICRC1 ? assets?.length : subaccounts.length
      })`,
    },
    {
      name: "Contacts",
      path: CONTACTS,
      label: `${assets?.length !== 1 ? t("contacts") : t("contact")} (${contacts?.length})`,
    },
  ];

  return (
    <Fragment>
      <div className="flex flex-row gap-3 justify-start items-center w-full">
        {menuList.map((menu, k) => (
          <CustomButton
            key={k}
            size={"small"}
            intent={"noBG"}
            border={"underline"}
            className="flex flex-row justify-start items-center mb-4"
            onClick={() => {
              if (window.location.pathname !== menu.path) {
                history.push(menu.path);
              }
            }}
          >
            <p
              className={`!font-normal  mr-2 ${
                window.location.pathname !== menu.path
                  ? " text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60"
                  : "border-b border-SelectRowColor"
              }`}
            >
              {menu.label}
            </p>
          </CustomButton>
        ))}
      </div>
    </Fragment>
  );
};

export default Menu;
