import { HPLAsset } from "@redux/models/AccountModels";

interface AssetSymbolProps {
  sufix?: any;
  ft: HPLAsset;
  textClass?: string;
  outBoxClass?: string;
}

const AssetSymbol = ({ sufix, ft, textClass = "", outBoxClass = "" }: AssetSymbolProps) => {
  return (
    <div className="flex flex-row justify-start items-center gap-2">
      {sufix && sufix}
      {ft.name === "" ? (
        ft.token_name === "" ? (
          <div
            className={`flex justify-center items-center px-2 border border-AssetSymbol rounded bg-AssetSymbol/20 ${outBoxClass}`}
          >
            <p className={`text-sm dark:text-PrimaryTextColor text-PrimaryTextColorLight ${textClass}`}>{ft.id}</p>
          </div>
        ) : (
          <p className={`dark:text-PrimaryTextColor text-PrimaryTextColorLight  ${textClass}`}>{ft.token_symbol}</p>
        )
      ) : (
        <p className={`dark:text-PrimaryTextColor text-PrimaryTextColorLight ${textClass}`}>{ft.symbol}</p>
      )}
    </div>
  );
};

export default AssetSymbol;
