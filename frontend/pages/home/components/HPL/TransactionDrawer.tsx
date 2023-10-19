// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { useHPLTx } from "@pages/home/hooks/hplTxHook";
import { DrawerOption, HplTransactionsTypeEnum } from "@/const";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import SelectTransfer from "./SelectTransfer";
import { CustomButton } from "@components/Button";
import QRscanner from "@pages/components/QRscanner";

interface TransactionDrawerProps {
  setDrawerOpen(value: boolean): void;
  setHplTx(value: boolean): void;
  drawerOption: DrawerOption;
  drawerOpen: boolean;
  locat: string;
}

const TransactionDrawer = ({ setDrawerOpen, setHplTx, drawerOption, drawerOpen, locat }: TransactionDrawerProps) => {
  const { t } = useTranslation();
  const { subaccounts, from, setFrom, to, setTo, errMsg } = useHPLTx(drawerOpen, drawerOption, locat);
  const [summary, setSummary] = useState(false);
  const [qrView, setQRview] = useState("");

  return (
    <div className="flex flex-col justify-start items-between bg-PrimaryColorLight dark:bg-PrimaryColor w-full h-full pt-8 px-6 text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
      {!summary ? (
        qrView ? (
          <div className="flex flex-col justify-start items-center w-full">
            <div className="flex flex-row justify-between items-center w-full mb-3">
              <p className="text-lg font-bold">{t("transaction")}</p>
              <CloseIcon
                className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
                onClick={onClose}
              />
            </div>
            <QRscanner qrView={qrView !== ""} onSuccess={onQRSuccess} setQRview={setQRviewClose} />
          </div>
        ) : (
          <Fragment>
            <div className="flex flex-col justify-start items-center w-full">
              <div className="flex flex-row justify-between items-center w-full mb-3">
                <p className="text-lg font-bold">{t("transaction")}</p>
                <CloseIcon
                  className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
                  onClick={onClose}
                />
              </div>
              <SelectTransfer
                select={from}
                setSelect={setFrom}
                subaccounts={subaccounts}
                txType={HplTransactionsTypeEnum.Enum.from}
                setQRview={setQRview}
              />
              <SelectTransfer
                select={to}
                setSelect={setTo}
                subaccounts={subaccounts}
                txType={HplTransactionsTypeEnum.Enum.to}
                setQRview={setQRview}
              />
            </div>
            <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
              <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
              <CustomButton className="min-w-[5rem]" onClick={onNext} size={"small"}>
                <p>{t("next")}</p>
              </CustomButton>
            </div>
          </Fragment>
        )
      ) : (
        <Fragment></Fragment>
      )}
    </div>
  );

  function onClose() {
    setDrawerOpen(false);
    setHplTx(false);
    setQRview("");
  }
  function onNext() {
    setSummary(true);
  }
  function onQRSuccess() {
    setQRview("");
  }
  function setQRviewClose(value: boolean) {
    !value && setQRview("");
  }
};

export default TransactionDrawer;
