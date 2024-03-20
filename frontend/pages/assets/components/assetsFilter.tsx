// svgs
import SearchIcon from "@assets/svg/files/icon-search.svg";
//
import { CustomInput } from "@components/input";
import { SwitchButton } from "@components/switch";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

interface AssetFiltersProps {
  searchKey: string;
  setSearchKey(value: string): void;
  allAssets: boolean;
  onAllAssetToggle(value: boolean): void;
}

const AssetsFilter = ({ searchKey, setSearchKey, allAssets, onAllAssetToggle }: AssetFiltersProps) => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className="flex flex-row items-center justify-between w-full text-md">
        <CustomInput
          compOutClass="!w-[30%]"
          prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
          intent={"secondary"}
          sizeInput={"medium"}
          placeholder={t("search")}
          value={searchKey}
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
        />
        <SwitchButton textLeft={t("show.all.assets")} enabled={allAssets} onToggle={onToggle} />
      </div>
    </Fragment>
  );

  function onToggle() {
    onAllAssetToggle(!allAssets);
  }
};

export default AssetsFilter;
