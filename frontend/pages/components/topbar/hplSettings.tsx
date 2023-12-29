// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomButton } from "@components/Button";
import { CustomInput } from "@components/Input";
import LoadingLoader from "@components/Loader";
import { Principal } from "@dfinity/principal";
import { AccountHook } from "@pages/hooks/accountHook";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { idlFactory as IngressIDLFactory } from "@candid/HPL/candid.did";
import { _SERVICE as DictionaryActor } from "@candid/Dictionary/dictService.did";
import { idlFactory as DictionaryIDLFactory } from "@candid/Dictionary/dictCandid.did";
import { ChangeEvent, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Actor } from "@dfinity/agent";
import { useAppDispatch } from "@redux/Store";
import {
  setFeeConstant,
  setHPLAssets,
  setHPLClient,
  setHPLDictionary,
  setIngressActor,
} from "@redux/assets/AssetReducer";
import { HPLClient } from "@research-ag/hpl-client";
import { updateHPLBalances } from "@redux/assets/AssetActions";
import { useHPL } from "@pages/hooks/hplHook";
import { getUpdatedFts, parseFungibleToken } from "@/utils";
import { setHplDictionaryPrincipal } from "@redux/auth/AuthReducer";
import { AssetHook } from "@pages/home/hooks/assetHook";

interface HplSettingsModalProps {
  setOpen(value: string): void;
}

const HplSettingsModal = ({ setOpen }: HplSettingsModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { hplDictionary, hplLedger, userAgent, authClient } = AccountHook();
  const { reloadOnlyHPLBallance } = AssetHook();
  const { hplFTs, hplContacts } = useHPL(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [ledger, setLeder] = useState({ principal: hplLedger, err: false });
  const [dictionary, setDictionary] = useState({ principal: hplDictionary, err: false });

  return (
    <Fragment>
      <div className="flex flex-row justify-between items-center w-full mb-2 top-modal">
        <p className="font-bold text-[1.15rem]">{t("hpl.settings")}</p>
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setOpen("");
          }}
        />
      </div>
      <p className="text-md mt-2">{t("hpl.settings.msg")}</p>
      <div className="flex flex-col items-start w-full mt-3 mb-3 text-sm">
        <p className="opacity-60">{"Ledger Principal"}</p>
        <CustomInput
          sizeInput={"medium"}
          intent={"secondary"}
          border={ledger.err ? "error" : undefined}
          placeholder=""
          compOutClass=""
          value={ledger.principal}
          onChange={onLedgerChange}
          autoFocus
        />
        <p className="opacity-60 mt-4">{t("dictionary.principal")}</p>
        <CustomInput
          sizeInput={"medium"}
          intent={"secondary"}
          border={dictionary.err ? "error" : undefined}
          placeholder=""
          compOutClass=""
          value={dictionary.principal}
          onChange={onDictionaryChange}
        />
      </div>
      <div className="flex flex-row justify-between items-center mt-4 gap-2 w-full">
        <p className="text-sm text-TextErrorColor">{t(errMsg)}</p>
        <CustomButton className="min-w-[5rem]" onClick={onSave} size={"small"}>
          {loading ? <LoadingLoader className="mt-1" /> : <p>{t("save")}</p>}
        </CustomButton>
      </div>
    </Fragment>
  );
  function onLedgerChange(e: ChangeEvent<HTMLInputElement>) {
    try {
      Principal.fromText(e.target.value);
      setLeder({ principal: e.target.value.trim(), err: false });
    } catch {
      setLeder({ principal: e.target.value.trim(), err: true });
    }
    setErrMsg("");
  }
  function onDictionaryChange(e: ChangeEvent<HTMLInputElement>) {
    try {
      Principal.fromText(e.target.value);
      setDictionary({ principal: e.target.value.trim(), err: false });
    } catch {
      setDictionary({ principal: e.target.value.trim(), err: e.target.value === "" ? false : true });
    }
    setErrMsg("");
  }
  async function onSave() {
    if (!ledger.err && !dictionary.err) {
      setLoading(true);
      if (hplLedger !== ledger.principal)
        try {
          const hplActor = Actor.createActor<IngressActor>(IngressIDLFactory, {
            agent: userAgent,
            canisterId: ledger.principal,
          });
          dispatch(setIngressActor(hplActor));
          const client = new HPLClient(ledger.principal, "ic");
          dispatch(setHPLClient(client));
          try {
            const feeConstant = await hplActor.feeRatio();
            dispatch(setFeeConstant(Number(feeConstant.toString())));
          } catch (e) {
            console.log("feeConstant-err", e);
          }
          localStorage.setItem("hpl-led-pric-" + authClient, ledger.principal);
          await updateHPLBalances(hplActor, hplContacts, authClient, false, false);
        } catch (e) {
          setLeder((prev) => {
            return { ...prev, err: true };
          });
          setErrMsg("hpl.ledger.principal.err");
          setLoading(false);
          console.log("Ledger-prin-err:", e);
          return;
        }
      else setOpen("");

      if (hplDictionary !== dictionary.principal)
        if (dictionary.principal !== "")
          try {
            const dictActor = Actor.createActor<DictionaryActor>(DictionaryIDLFactory, {
              agent: userAgent,
              canisterId: dictionary.principal,
            });
            const dictFTs = await dictActor.getDump();
            localStorage.setItem("hpl-dict-pric-" + authClient, dictionary.principal);
            dispatch(setHPLDictionary(parseFungibleToken(dictFTs)));
            const auxFts = getUpdatedFts(dictFTs, hplFTs);
            dispatch(setHPLAssets(auxFts));
            dispatch(setHplDictionaryPrincipal(dictionary.principal));
            setOpen("");
          } catch (e) {
            setDictionary((prev) => {
              return { ...prev, err: true };
            });
            setErrMsg("hpl.dictionary.principal.err");
            setLoading(false);
            console.log("Dict-prin-err:", e);
            return;
          }
        else {
          const auxFts = getUpdatedFts([], hplFTs);
          dispatch(setHPLAssets(auxFts));
          dispatch(setHplDictionaryPrincipal(dictionary.principal));
          localStorage.removeItem("hpl-dict-pric-" + authClient);
          dispatch(setHPLDictionary([]));
          reloadOnlyHPLBallance();
          setOpen("");
        }
      else;
      setOpen("");
    }
    setLoading(false);
  }
};

export default HplSettingsModal;
