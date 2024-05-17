import { FC, Fragment } from "react";
import QRCode from "react-qr-code";
import { CustomCopy } from "@components/tooltip";
import { useHPL } from "@pages/hooks/hplHook";
import { useTranslation } from "react-i18next";
import { getPxlCode } from "@common/utils/hpl";

interface HPLDrawerReceive {
  virtualAccount: string | null;
}

const HPLDrawerReceive: FC<HPLDrawerReceive> = ({ virtualAccount }) => {
  const { t } = useTranslation();
  const { ownerId } = useHPL(false);

  const qrCodeValue = getPxlCode(ownerId, virtualAccount || "");

  return (
    <Fragment>
      <div className="flex flex-col justify-start items-center w-full h-full gap-4 pt-[30%]">
        <div className="flex justify-center items-center w-[60%] border-4 border-SelectRowColor bg-white rounded-lg p-3">
          <QRCode
            style={{ height: "auto", maxWidth: "100%", width: "100%", borderRadius: "0.5rem" }}
            value={qrCodeValue}
          />
        </div>
        <div className="flex flex-row justify-center items-center">
          <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor mr-5">{t("virtual")}:</p>
          <div className="flex flex-row justify-center items-center p-2 border border-BorderColorLight dark:border-BorderColor bg-PrimaryColorLight dark:bg-SecondaryColor rounded">
            <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor mr-2 break-all">{qrCodeValue}</p>
            <CustomCopy
              background="default"
              copyStroke="fill-PrimaryTextColor"
              size={"small"}
              boxSize={"small"}
              copyText={qrCodeValue}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default HPLDrawerReceive;
