import { HPLAsset } from "@redux/models/AccountModels";

interface AssetSymbolProps {
  sufix?: any;
  ft: HPLAsset;
  textClass?: string;
  outBoxClass?: string;
  inBoxClass?: string;
  compClass?: string;
}

const AssetSymbol = ({
  sufix,
  ft,
  textClass = "",
  outBoxClass = "",
  inBoxClass = "text-PrimaryTextColorLight dark:text-PrimaryTextColor",
  compClass = "",
}: AssetSymbolProps) => {
  return (
    <div className={`flex flex-row justify-start items-center gap-2 ${compClass}`}>
      {sufix && sufix}
      {ft.name === "" ? (
        ft.token_name === "" ? (
          <div
            className={`flex justify-center items-center px-2 border border-AssetSymbol rounded bg-AssetSymbol/20 ${outBoxClass}`}
          >
            <p className={`text-sm ${inBoxClass}`}>{ft.id}</p>
          </div>
        ) : (
          <p className={`${textClass}`}>{ft.token_symbol}</p>
        )
      ) : (
        <p className={`${textClass}`}>{ft.symbol}</p>
      )}
    </div>
  );
};

export default AssetSymbol;
