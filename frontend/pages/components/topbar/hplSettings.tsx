// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import ChevIcon from "@assets/svg/files/chev-icon.svg";
//
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CustomButton } from "@components/button";
import { CustomInput } from "@components/input";
import { LoadingLoader } from "@components/loader";
import { Principal } from "@dfinity/principal";
import { AccountHook } from "@pages/hooks/accountHook";
import { _SERVICE as IngressActor } from "@candid/HPL/service.did";
import { idlFactory as IngressIDLFactory } from "@candid/HPL/candid.did";
import { ChangeEvent, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Actor } from "@dfinity/agent";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { setFeeConstant, setHPLClient, setHPLDictionary, setIngressActor } from "@redux/hpl/HplReducer";
import { HPLClient } from "@research-ag/hpl-client";
import { updateHPLBalances } from "@redux/assets/AssetActions";
import { setHplDictionaryPrincipal } from "@redux/auth/AuthReducer";
import { AssetHook } from "@pages/home/hooks/assetHook";
import { defaultHplLedgers } from "@common/defaultTokens";
import { db } from "@/database/db";

interface HplSettingsModalProps {
  setOpen(value: string): void;
}

const HplSettingsModal = ({ setOpen }: HplSettingsModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { hplDictionary, hplLedger, userAgent, authClient } = AccountHook();
  const { ownersActor } = useAppSelector((state) => state.hpl);
  const { reloadDictFts } = AssetHook();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [ledger, setLeder] = useState({ principal: hplLedger, err: false });
  const [dictionary, setDictionary] = useState({ principal: hplDictionary, err: false });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Fragment>
      <div className="flex flex-row items-center justify-between w-full mb-2 top-modal">
        <p className="font-bold text-[1.15rem]">{t("hpl.settings")}</p>
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setOpen("");
          }}
        />
      </div>
      <p className="mt-2 text-md">{t("hpl.settings.msg")}</p>
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
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          sufix={
            <DropdownMenu.Root
              open={modalOpen}
              onOpenChange={() => {
                setModalOpen(!modalOpen);
              }}
            >
              <DropdownMenu.Trigger asChild>
                <img
                  src={ChevIcon}
                  style={{ width: "2rem", height: "2rem" }}
                  alt="chevron-icon"
                  className={`cursor-pointer ${modalOpen ? "rotate-90" : ""}`}
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="text-md w-[29rem]  bg-PrimaryColorLight rounded-lg dark:bg-PrimaryColor z-[2100] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo dark:border-BorderColor border"
                  sideOffset={5}
                  align="end"
                  alignOffset={-5}
                >
                  {defaultHplLedgers.map((ledger, k) => {
                    return (
                      <DropdownMenu.Item key={k}>
                        <button
                          className="flex justify-start p-2 w-full  cursor-pointer hover:dark:bg-ThirdColor rounded-lg"
                          onClick={() => {
                            onLedgerSelect(ledger);
                          }}
                        >
                          <p>{ledger}</p>
                        </button>
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          }
        />

        <p className="mt-4 opacity-60">{t("dictionary.principal")}</p>
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
      <div className="flex flex-row items-center justify-between w-full gap-2 mt-4">
        <p className="text-sm text-TextErrorColor">{t(errMsg)}</p>
        <CustomButton className="min-w-[5rem]" onClick={onSave} size={"small"}>
          {loading ? <LoadingLoader className="mt-1" /> : <p>{t("save")}</p>}
        </CustomButton>
      </div>
    </Fragment>
  );

  function onLedgerSelect(ledger: string) {
    setLeder({ principal: ledger, err: false });
  }

  function onLedgerChange(e: ChangeEvent<HTMLInputElement>) {
    try {
      Principal.fromText(e.target.value.trim());
      setLeder({ principal: e.target.value.trim(), err: false });
    } catch {
      setLeder({ principal: e.target.value.trim(), err: true });
    }
    setErrMsg("");
  }
  function onDictionaryChange(e: ChangeEvent<HTMLInputElement>) {
    try {
      Principal.fromText(e.target.value.trim());
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
          await db().setHplLedger(ledger.principal);
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
          const contacts = await db().getHplContacts();
          await updateHPLBalances(hplActor, ownersActor, contacts, authClient, false, true);
        } catch (e) {
          setLeder((prev) => {
            return { ...prev, err: true };
          });
          setErrMsg("hpl.ledger.principal.err");
          setLoading(false);
          console.log("Ledger-prin-err:", e);
          return;
        }

      if (hplDictionary !== dictionary.principal)
        if (dictionary.principal !== "")
          try {
            await reloadDictFts(dictionary.principal);
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
          dispatch(setHplDictionaryPrincipal(dictionary.principal));
          localStorage.setItem("hpl-dict-pric-" + authClient, "");
          dispatch(setHPLDictionary([]));
          reloadDictFts();
          setOpen("");
        }
      else setOpen("");
    }
    setLoading(false);
  }
};

export default HplSettingsModal;
