// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { useHPLTx } from "@pages/home/hooks/hplTxHook";
import { DrawerOption, HplTransactionsEnum, HplTransactionsTypeEnum } from "@common/const";
import { FC, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import SelectTransfer from "./SelectTransfer";
import { CustomButton } from "@components/button";
import QRscanner from "@pages/components/QRscanner";
import { HplTxUser } from "@redux/models/AccountModels";
import { Principal } from "@dfinity/principal";
import { useHPL } from "@pages/hooks/hplHook";
import { LoadingLoader } from "@components/loader";
import TxSummary from "./TxSummary";
import { getOwnerInfoFromPxl } from "@common/utils/hpl";
import logger from "@/common/utils/logger";

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
    checkIfIsContact,
  } = useHPLTx(drawerOpen, drawerOption, locat);

  const { getAssetLogo, getFtFromSub, reloadHPLBallance } = useHPL(false);
  const [summary, setSummary] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [qrView, setQRview] = useState("");
  const [rmtAmountFrom, setRmtAmountFrom] = useState("0");
  const [rmtAmountTo, setRmtAmountTo] = useState("0");
  const [ftId, setFtId] = useState("0");
  const [decimals, setDecimals] = useState(0);
  const [manualFromFt, setManualFromFt] = useState<string>();
  const [manualToFt, setManualToFt] = useState<string>();
  const [clearCam, setClearCam] = useState<boolean>(false);

  return (
    <div className="flex flex-col justify-start w-full h-full px-6 pt-8 items-between bg-PrimaryColorLight dark:bg-PrimaryColor text-PrimaryTextColorLight dark:text-PrimaryTextColor text-md">
      <div className="flex flex-row items-center justify-between w-full mb-3">
        <p className="text-lg font-bold">{t("transaction")}</p>
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
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
          setRmtAmountFrom={setRmtAmountFrom}
          setRmtAmountTo={setRmtAmountTo}
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
          setDrawerOpen={setDrawerOpen}
          ingressActor={ingressActor}
        />
      );
    }

    if (qrView) {
      return (
        <div className="flex flex-col items-center justify-start w-full">
          <QRscanner qrView={qrView !== ""} onSuccess={onQRSuccess} setQRview={setQRviewClose} outsideBack={clearCam} />
        </div>
      );
    }

    return (
      <Fragment>
        <div className="flex flex-col items-center justify-start w-full">
          <SelectTransfer
            getAssetLogo={getAssetLogo}
            getFtFromSub={getFtFromSub}
            select={from}
            hplContacts={hplContacts}
            setSelect={setFrom}
            subaccounts={subaccounts}
            txType={HplTransactionsTypeEnum.Enum.from}
            setQRview={setQRview}
            otherAsset={to.subaccount?.ft || to.remote?.ftIndex || manualToFt}
            otherId={to.subaccount?.sub_account_id || to.remote?.index}
            otherPrincipal={to.remote ? to.principal : undefined}
            isRemote={to.type === HplTransactionsEnum.Enum.VIRTUAL}
            otherCode={to.type === HplTransactionsEnum.Enum.VIRTUAL ? to.code : undefined}
            errMsg={errMsgFrom}
            manualFt={manualFromFt}
            setManualFt={setManualFromFt}
            getPrincipalFromOwnerId={getPrincipalFromOwnerId}
            getAssetId={getAssetId}
            setErrMsg={setErrMsgFrom}
            setClearCam={setClearCam}
            checkIfIsContact={checkIfIsContact}
            loadingNext={loadingNext}
          />
          <SelectTransfer
            getAssetLogo={getAssetLogo}
            getFtFromSub={getFtFromSub}
            select={to}
            hplContacts={hplContacts}
            setSelect={setTo}
            subaccounts={subaccounts}
            txType={HplTransactionsTypeEnum.Enum.to}
            setQRview={setQRview}
            otherAsset={from.subaccount?.ft || from.remote?.ftIndex || manualFromFt}
            otherId={from.subaccount?.sub_account_id || from.remote?.index}
            otherPrincipal={from.remote ? from.principal : undefined}
            isRemote={from.type === HplTransactionsEnum.Enum.VIRTUAL}
            otherCode={from.type === HplTransactionsEnum.Enum.VIRTUAL ? from.code : undefined}
            errMsg={errMsgTo}
            manualFt={manualToFt}
            setManualFt={setManualToFt}
            getPrincipalFromOwnerId={getPrincipalFromOwnerId}
            getAssetId={getAssetId}
            setErrMsg={setErrMsgTo}
            setClearCam={setClearCam}
            checkIfIsContact={checkIfIsContact}
            loadingNext={loadingNext}
          />
        </div>
        <div className="flex flex-row items-center justify-end w-full gap-4 mt-12">
          <CustomButton id="on-next-send-hpl" className="min-w-[5rem]" onClick={onNext} size={"small"}>
            {loadingNext ? <LoadingLoader className="mt-1" /> : <p>{t("next")}</p>}
          </CustomButton>
        </div>
      </Fragment>
    );
  }

  function onClose() {
    setClearCam(true);
    setAmount("");
    setAmountReceiver("");
    setLoadingNext(false);
    setSummary(false);
    setDrawerOpen(false);
    setManualToFt(undefined);
    setManualFromFt(undefined);
    setFrom({
      type: HplTransactionsEnum.Enum.SUBACCOUNT,
      principal: "",
      vIdx: "",
      subaccount: undefined,
    });
    setTo({
      type: HplTransactionsEnum.Enum.SUBACCOUNT,
      principal: "",
      vIdx: "",
      subaccount: undefined,
    });
  }

  async function validateData(selection: string) {
    let valid = true;
    const ftId = await getAssetId(selection === "from" ? from : to);

    const manual = selection === "from" ? !(from.subaccount || from.remote) : !(to.subaccount || to.remote);
    if (!validation(selection === "from" ? from : to)) {
      valid = false;
      if (selection === "from") setErrMsgFrom("err.from");
      else setErrMsgTo("err.to");
    } else if (ftId.ft === "non" || ftId.ft === "") {
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
      if (fromFtId.ft !== toFtId.ft)
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
      setFtId(fromFtId.ft ? fromFtId.ft : toFtId.ft);
      setDecimals(getFtFromSub(fromFtId.ft).decimal);
      // if (from.type === HplTransactionsEnum.Enum.VIRTUAL) {
      //   await getVirtualAmount(from, setRmtAmountFrom);
      // }
      // if (to.type === HplTransactionsEnum.Enum.VIRTUAL) {
      //   await getVirtualAmount(to, setRmtAmountTo);
      // }
      setSummary(true);
    }

    setLoadingNext(false);
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
        principalName: undefined,
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
          } catch (error) {
            logger.debug(error);
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
    let blnc = "";
    if (data.subaccount) {
      id = data.subaccount.ft;
      blnc = data.subaccount.amount;
    } else if (data.remote) {
      id = data.remote.ftIndex;
      blnc = data.remote.amount;
    } else if (data.principal !== "" && data.vIdx !== "") {
      return getAssetIdFromPrinc(data.principal, data.vIdx);
    } else if (data.code && data.code !== "") {
      const ownerInfo = getOwnerInfoFromPxl(data.code);
      if (ownerInfo) {
        const princ = await getPrincipalFromOwnerId(ownerInfo.ownerId);
        if (princ) {
          return getAssetIdFromPrinc(princ.toText(), ownerInfo.linkId);
        }
      }
    } else return { ft: "", balance: "" };
    return { ft: id, balance: blnc };
  }

  async function getAssetIdFromPrinc(principal: string, vIdx: string) {
    try {
      const rem = await ingressActor.remoteAccountInfo({
        id: [Principal.fromText(principal), BigInt(vIdx)],
      });
      if (rem.length === 0) return { ft: "non", balance: "" };
      const auxState = await ingressActor.state({
        ftSupplies: [],
        virtualAccounts: [],
        accounts: [],
        remoteAccounts: [
          {
            id: [Principal.fromText(principal), BigInt(vIdx)],
          },
        ],
      });
      return { ft: rem[0][1].ft.toString(), balance: auxState.remoteAccounts[0][1][0].ft.toString() };
    } catch (error) {
      logger.debug(error);
      return { ft: "", balance: "" };
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
