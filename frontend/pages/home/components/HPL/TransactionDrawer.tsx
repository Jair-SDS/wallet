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
import { getOwnerInfoFromPxl } from "@/utils";

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
    errMsgFrom,
    setErrMsgFrom,
    errMsgTo,
    setErrMsgTo,
    amount,
    setAmount,
    amountReceiver,
    setAmountReceiver,
    hplContacts,
    getPrincipalFromOwnerId,
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
  const [manualFromFt, setManualFromFt] = useState<string>();
  const [manualToFt, setManualToFt] = useState<string>();

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
          errMsg={errMsgFrom}
          setErrMsg={setErrMsgFrom}
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
            otherAsset={to.subaccount?.ft || to.remote?.ftIndex || manualToFt}
            otherId={to.subaccount?.sub_account_id || to.remote?.index}
            otherPrincipal={to.remote ? to.principal : undefined}
            isRemote={to.type === HplTransactionsEnum.Enum.VIRTUAL}
            errMsg={errMsgFrom}
            setManualFt={setManualFromFt}
            getPrincipalFromOwnerId={getPrincipalFromOwnerId}
            getAssetId={getAssetId}
            setErrMsg={setErrMsgFrom}
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
            otherAsset={from.subaccount?.ft || from.remote?.ftIndex || manualFromFt}
            otherId={from.subaccount?.sub_account_id || from.remote?.index}
            otherPrincipal={from.remote ? from.principal : undefined}
            isRemote={from.type === HplTransactionsEnum.Enum.VIRTUAL}
            errMsg={errMsgTo}
            setManualFt={setManualToFt}
            getPrincipalFromOwnerId={getPrincipalFromOwnerId}
            getAssetId={getAssetId}
            setErrMsg={setErrMsgTo}
          />
        </div>
        <div className="w-full flex flex-row justify-end items-center mt-12 gap-4">
          <CustomButton id="on-next-send-hpl" className="min-w-[5rem]" onClick={onNext} size={"small"}>
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

  async function validateData(selection: string) {
    let valid = true;
    const ftId = await getAssetId(selection === "from" ? from : to);
    const manual = selection === "from" ? !(from.subaccount || from.remote) : !(to.subaccount || to.remote);
    if (!validation(selection === "from" ? from : to)) {
      valid = false;
      if (selection === "from") setErrMsgFrom("err.from");
      else setErrMsgTo("err.to");
    } else if (ftId === "non" || ftId === "") {
      valid = false;
      if (selection === "from") setErrMsgFrom(t("remote.no.yours.from"));
      else setErrMsgTo(t("remote.no.yours.to"));
    }
    return { ftId, valid, manual };
  }

  async function validateAssetMatch() {
    let valid = false;

    const { ftId: fromFtId, valid: validFrom, manual: manualFrom } = await validateData("from");
    const { ftId: toFtId, valid: validTo, manual: manualTo } = await validateData("to");
    if (validFrom && validTo)
      if (fromFtId !== toFtId)
        manualTo || !manualFrom ? setErrMsgTo("not.match.asset.id") : setErrMsgFrom("not.match.asset.id");
      else if (!errMsgFrom && !errMsgTo) valid = true;

    return { fromFtId, toFtId, valid };
  }

  async function onNext() {
    setLoadingNext(true);
    setAmount("");
    setAmountReceiver("");

    const { fromFtId, toFtId, valid } = await validateAssetMatch();

    if (valid) {
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

  async function onQRSuccess(value: string) {
    const data = await parseQrCode(value);
    if (data.err === "") {
      const newTx = {
        type: HplTransactionsEnum.Enum.VIRTUAL,
        principal: data.principal,
        vIdx: data.id,
        subaccount: undefined,
        remote: undefined,
        code: data.code,
      };
      if (qrView === HplTransactionsTypeEnum.Enum.from) {
        setFrom(newTx);
      } else {
        setTo(newTx);
      }
    } else {
      if (qrView === HplTransactionsTypeEnum.Enum.from) setErrMsgFrom("err.qr.img");
      else setErrMsgTo("err.qr.img");
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
        if (data.code && data.code.trim() !== "") {
          const ownerInfo = getOwnerInfoFromPxl(data.code);
          return !!ownerInfo;
        } else if (data.principal.trim() === "") return false;
        else if (data.vIdx.trim() === "") return false;
        else if (data.principal.trim() !== "") {
          try {
            Principal.fromText(data.principal.trim());
          } catch {
            return false;
          }
          return true;
        } else {
          return false;
        }
      default:
        return false;
    }
  }

  async function getAssetId(data: HplTxUser) {
    let id = "";
    if (data.subaccount) id = data.subaccount.ft;
    else if (data.remote) id = data.remote.ftIndex;
    else if (data.principal !== "" && data.vIdx !== "") {
      return getAssetIdFromPrinc(data.principal, data.vIdx);
    } else if (data.code && data.code !== "") {
      const ownerInfo = getOwnerInfoFromPxl(data.code);
      if (ownerInfo) {
        const princ = await getPrincipalFromOwnerId(ownerInfo.ownerId);
        if (princ) {
          return getAssetIdFromPrinc(princ.toText(), ownerInfo.linkId);
        }
      }
    } else return "";
    return id;
  }

  async function getAssetIdFromPrinc(principal: string, vIdx: string) {
    try {
      const rem = await ingressActor.remoteAccountInfo({
        id: [Principal.fromText(principal), BigInt(vIdx)],
      });
      if (rem.length === 0) return "non";
      return rem[0][1].ft.toString();
    } catch {
      return "";
    }
  }

  async function parseQrCode(code: string) {
    const ownerInfo = getOwnerInfoFromPxl(code);
    if (ownerInfo) {
      const princ = await getPrincipalFromOwnerId(ownerInfo.ownerId);
      if (princ) {
        return {
          code: code,
          principal: princ.toText(),
          id: ownerInfo.linkId,
          err: "",
        };
      } else {
        return { code: "", principal: "", id: "", err: "err-form" };
      }
    } else {
      return { code: "", principal: "", id: "", err: "err-princ" };
    }
  }
};

export default TransactionDrawer;
