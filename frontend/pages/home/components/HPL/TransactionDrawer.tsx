// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { useHPLTx } from "@pages/home/hooks/hplTxHook";
import { DrawerOption, HplTransactionsEnum, HplTransactionsTypeEnum } from "@/const";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { FC, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import SelectTransfer from "./SelectTransfer";
import { CustomButton } from "@components/Button";
import QRscanner from "@pages/components/QRscanner";
import { HplTxUser } from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { useHPL } from "@pages/hooks/hplHook";
import LoadingLoader from "@components/Loader";
import TxSummary from "./TxSummary";
import { toNumberFromUint8Array } from "@/utils";

interface TransactionDrawerProps {
  setDrawerOpen(value: boolean): void;
  drawerOption: DrawerOption;
  drawerOpen: boolean;
  locat: string;
}

const TransactionDrawer: FC<TransactionDrawerProps> = ({ setDrawerOpen, drawerOption, drawerOpen, locat }) => {
  const { t } = useTranslation();
  const {
    hplClient,
    ingressActor,
    subaccounts,
    from,
    setFrom,
    to,
    setTo,
    errMsg,
    setErrMsg,
    amount,
    setAmount,
    amountReceiver,
    setAmountReceiver,
    hplContacts,
  } = useHPLTx(drawerOpen, drawerOption, locat);

  const { getAssetLogo, getFtFromSub, reloadHPLBallance } = useHPL(false);
  const [summary, setSummary] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [manualFrom, setManualFrom] = useState(false);
  const [manualTo, setManualTo] = useState(false);
  const [qrView, setQRview] = useState("");
  const [rmtAmountFrom, setRmtAmountFrom] = useState("0");
  const [rmtAmountTo, setRmtAmountTo] = useState("0");
  const [ftId, setFtId] = useState("0");
  const [decimals, setDecimals] = useState(0);

  return (
    <div className="flex flex-col justify-start items-between bg-PrimaryColorLight dark:bg-PrimaryColor w-full h-full pt-8 px-6 text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
      <div className="flex flex-row justify-between items-center w-full mb-3">
        <p className="text-lg font-bold">{t("transaction")}</p>
        <CloseIcon
          className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
          onClick={onClose}
        />
      </div>
      {getContent()}
    </div>
  );

  function getContent() {
    if (summary) {
      return (
        <TxSummary
          from={from}
          to={to}
          getAssetLogo={getAssetLogo}
          getFtFromSub={getFtFromSub}
          ftId={ftId}
          rmtAmountFrom={rmtAmountFrom}
          rmtAmountTo={rmtAmountTo}
          amount={amount}
          decimals={decimals}
          setAmount={setAmount}
          setAmountReceiver={setAmountReceiver}
          amountReceiver={amountReceiver}
          errMsg={errMsg}
          setErrMsg={setErrMsg}
          setFtId={setFtId}
          setDecimals={setDecimals}
          setSummary={setSummary}
          hplClient={hplClient}
          onClose={onClose}
          reloadHPLBallance={reloadHPLBallance}
        />
      );
    }

    if (qrView) {
      return (
        <div className="flex flex-col justify-start items-center w-full">
          <QRscanner qrView={qrView !== ""} onSuccess={onQRSuccess} setQRview={setQRviewClose} />
        </div>
      );
    }

    return (
      <Fragment>
        <div className="flex flex-col justify-start items-center w-full">
          <SelectTransfer
            getAssetLogo={getAssetLogo}
            getFtFromSub={getFtFromSub}
            select={from}
            manual={manualFrom}
            setManual={setManualFrom}
            hplContacts={hplContacts}
            setSelect={setFrom}
            subaccounts={subaccounts}
            txType={HplTransactionsTypeEnum.Enum.from}
            setQRview={setQRview}
            otherAsset={to.subaccount?.ft || to.remote?.ftIndex}
            otherId={to.subaccount?.sub_account_id || to.remote?.index}
            otherPrincipal={to.remote ? to.principal : undefined}
          />
          <SelectTransfer
            getAssetLogo={getAssetLogo}
            getFtFromSub={getFtFromSub}
            select={to}
            manual={manualTo}
            setManual={setManualTo}
            hplContacts={hplContacts}
            setSelect={setTo}
            subaccounts={subaccounts}
            txType={HplTransactionsTypeEnum.Enum.to}
            setQRview={setQRview}
            otherAsset={from.subaccount?.ft || from.remote?.ftIndex}
            otherId={from.subaccount?.sub_account_id || from.remote?.index}
            otherPrincipal={from.remote ? from.principal : undefined}
          />
        </div>
        <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
          <p className="text-sm text-TextErrorColor text-left">{t(errMsg)}</p>
          <CustomButton className="min-w-[5rem]" onClick={onNext} size={"small"}>
            {loadingNext ? <LoadingLoader className="mt-1" /> : <p>{t("next")}</p>}
          </CustomButton>
        </div>
      </Fragment>
    );
  }

  function onClose() {
    setDrawerOpen(false);
    setQRview("");
    setAmount("");
    setAmountReceiver("");
    setManualFrom(false);
    setManualTo(false);
    setLoadingNext(false);
    setSummary(false);
  }

  async function onNext() {
    setAmount("");
    setAmountReceiver("");
    setLoadingNext(true);
    const fromFtId = await getAssetId(from);
    const toFtId = await getAssetId(to);
    if (!validation(from)) setErrMsg("err.from");
    else if (!validation(to)) setErrMsg("err.to");
    else if (fromFtId === "non") setErrMsg(t("remote.no.yours.from", { from: getNametoShowinErr(to, "to") }));
    else if (toFtId === "non") setErrMsg(t("remote.no.yours.to", { to: getNametoShowinErr(from, "from") }));
    else if (fromFtId === "" || toFtId === "" || fromFtId !== toFtId) setErrMsg("not.match.asset.id");
    else if (!errMsg) {
      setFtId(fromFtId ? fromFtId : toFtId);
      setDecimals(getFtFromSub(fromFtId).decimal);
      if (from.type === HplTransactionsEnum.Enum.VIRTUAL) {
        await getVirtualAmount(from, setRmtAmountFrom);
      }
      if (to.type === HplTransactionsEnum.Enum.VIRTUAL) {
        await getVirtualAmount(to, setRmtAmountTo);
      }
      setSummary(true);
    }
    setLoadingNext(false);
  }

  async function getVirtualAmount(rmt: HplTxUser, set: (val: string) => void) {
    try {
      const auxState = await ingressActor.state({
        ftSupplies: [],
        virtualAccounts: [],
        accounts: [],
        remoteAccounts: [{ id: [Principal.fromText(rmt.principal), BigInt(rmt.vIdx)] }],
      });
      set(auxState.remoteAccounts[0][1][0].ft.toString() || "0");
    } catch (e) {
      set("0");
    }
  }

  function onQRSuccess(value: string) {
    const data = parseQrCode(value);
    if (!data.err) {
      if (qrView === HplTransactionsTypeEnum.Enum.from) {
        setFrom({
          type: HplTransactionsEnum.Enum.VIRTUAL,
          principal: data.principal,
          vIdx: data.id,
          subaccount: undefined,
        });
      } else {
        setTo({
          type: HplTransactionsEnum.Enum.VIRTUAL,
          principal: data.principal,
          vIdx: data.id,
          subaccount: undefined,
        });
      }
    } else {
      setErrMsg("err.qr.img");
    }
    setQRview("");
  }

  function setQRviewClose(value: boolean) {
    !value && setQRview("");
  }

  function validation(data: HplTxUser) {
    switch (data.type) {
      case HplTransactionsEnum.Enum.SUBACCOUNT:
        return data.subaccount ? true : false;
      case HplTransactionsEnum.Enum.VIRTUAL:
        if (data.principal.trim() === "") return false;
        else if (data.vIdx.trim() === "") return false;
        else {
          try {
            Principal.fromText(data.principal.trim());
          } catch {
            return false;
          }
          return true;
        }
      default:
        return false;
    }
  }

  async function getAssetId(data: HplTxUser) {
    let id = "";
    if (data.subaccount) id = data.subaccount.ft;
    else if (data.remote) id = data.remote.ftIndex;
    else {
      try {
        const rem = await ingressActor.remoteAccountInfo({
          id: [Principal.fromText(data.principal), BigInt(data.vIdx)],
        });
        if (rem.length === 0) return "non";
        return rem[0][1].ft.toString();
      } catch {
        return "";
      }
    }
    return id;
  }

  function parseQrCode(code: string) {
    try {
      const princ = decodeIcrcAccount(code);
      return {
        principal: princ.owner.toString(),
        id: princ.subaccount ? toNumberFromUint8Array(princ.subaccount!).toString() : "0",
        err: false,
      };
    } catch {
      return { principal: "", id: "", err: true };
    }
  }

  function getNametoShowinErr(data: HplTxUser, userType: string) {
    if (data.subaccount) return data.subaccount.name ? data.subaccount.name : t(userType);
    else if (data.remote) return data.remote.name;
    else return t(userType);
  }
};

export default TransactionDrawer;
