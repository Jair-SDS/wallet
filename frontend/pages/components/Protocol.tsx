import { Fragment } from "react";
import { CustomButton } from "@components/Button";
import { AssetHook } from "@pages/home/hooks/assetHook";
import { ProtocolType, ProtocolTypeEnum } from "@/const";

const Protocol = () => {
  const { protocol, setProtocolType } = AssetHook();

  const menuList = Object.keys(ProtocolTypeEnum.Values);

  return (
    <Fragment>
      <div className="flex flex-row gap-3 justify-start items-center w-full">
        {menuList.map((prot, k) => (
          <CustomButton
            key={k}
            size={"small"}
            intent={"noBG"}
            border={"underline"}
            className="flex flex-row justify-start items-center mb-4"
            onClick={() => {
              setProtocolType(prot as ProtocolType);
            }}
          >
            <p
              className={`!font-normal  mr-2 ${
                protocol !== prot
                  ? " text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60"
                  : "border-b border-SelectRowColor"
              }`}
            >
              {prot}
            </p>
          </CustomButton>
        ))}
      </div>
    </Fragment>
  );
};

export default Protocol;
