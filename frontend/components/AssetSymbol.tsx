import { HPLAsset } from "@redux/models/AccountModels";
import { useEffect, useState } from "react";

interface AssetSymbolProps {
  sufix?: any;
  ft: HPLAsset;
  textClass?: string;
  outBoxClass?: string;
  inBoxClass?: string;
  compClass?: string;
  showBox?: boolean;
  emptyFormat?: boolean;
}

const AssetSymbol = ({
  sufix,
  ft,
  textClass = "",
  outBoxClass = "",
  inBoxClass = "text-PrimaryTextColorLight dark:text-PrimaryTextColor",
  compClass = "",
  showBox,
  emptyFormat,
}: AssetSymbolProps) => {
  const [label, setLabel] = useState(ft.symbol);
  const [boxView, setBoxView] = useState(ft.symbol === "" && ft.token_symbol === "");

  useEffect(() => {
    if (ft.symbol === "")
      if (ft.name === "")
        if (ft.token_symbol === "") {
          setLabel(ft.id);
          setBoxView(true);
        } else {
          setLabel(ft.token_symbol);
          setBoxView(false);
        }
      else {
        setLabel(ft.id);
        setBoxView(true);
      }
    else {
      setLabel(ft.symbol);
      setBoxView(false);
    }
  }, [ft]);

  return (
    <div className={`flex flex-row justify-start items-center gap-2 ${compClass}`}>
      {sufix && sufix}
      {boxView || showBox ? (
        !emptyFormat ? (
          <div
            className={`flex justify-center items-center px-2 border border-AssetSymbol rounded bg-AssetSymbol/20 ${outBoxClass}`}
          >
            <p className={`text-sm ${inBoxClass}`}>{showBox ? ft.id : label}</p>
          </div>
        ) : (
          <p></p>
        )
      ) : (
        <p className={`${textClass}`}>{label}</p>
      )}
    </div>
  );
};

export default AssetSymbol;
