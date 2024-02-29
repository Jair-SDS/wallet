// svg
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
import { ReactComponent as SearchIcon } from "@assets/svg/files/icon-search-uncolored.svg";
import QRIcon from "@assets/svg/files/qr.svg";
//
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomInput } from "@components/Input";
import { CustomButton } from "@components/Button";
import { useHplContacts } from "@pages/contacts/hooks/hplContactsHook";
import QRscanner from "@pages/components/QRscanner";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import { useHPL } from "@pages/hooks/hplHook";
import { HplContact } from "@redux/models/AccountModels";
import AddRemoteList from "./addRemotesList";

interface AddContactProps {
  setAddOpen(value: boolean): void;
  edit: HplContact | undefined;
}

const AddEditHplContact = ({ setAddOpen, edit }: AddContactProps) => {
  const { t } = useTranslation();
  const {
    newContact,
    setNewContact,
    newContactErr,
    setNewContactErr,
    newContactNameErr,
    setNewContactNameErr,
    newContactPrinErr,
    setNewContactPrinErr,
    chainRemotes,
    setChainremotes,
    checkIds,
    setCheckIds,
    onAddContact,
    fetchRemotes,
    searchRemotes,
  } = useHplContacts();
  const { ingressActor, getAssetLogo, getFtFromSub } = useHPL(false);
  const [qrView, setQRview] = useState(false);
  const [clearCam, setClearCam] = useState(false);
  const [nameErrs, setNameErrs] = useState<number[]>([]);

  useEffect(() => {
    fetchRemotes(edit, ingressActor);
  }, [edit]);

  return (
    <Fragment>
      <div className="reative flex flex-col justify-start items-start w-full gap-4 text-md">
        <CloseIcon
          className="absolute top-5 right-5 cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setAddOpen(false);
            setClearCam(true);
          }}
        />
        <p>{edit ? t("edit.contact") : t("add.contact")}</p>
        {qrView ? (
          <div className="flex flex-col justify-start items-center w-full gap-4 text-md ">
            <div className="w-[50%]">
              <QRscanner
                setQRview={setQRview}
                qrView={qrView}
                onSuccess={onSuccessQR}
                mb=""
                backButton={false}
                outsideBack={clearCam}
              />
            </div>
            <div className="flex flex-row justify-end items-center w-full gap-3">
              <CustomButton
                intent="deny"
                className="min-w-[5rem]"
                onClick={() => {
                  setClearCam(true);
                }}
              >
                <p>{t("back")}</p>
              </CustomButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-start items-start w-full gap-4 text-md">
            <div className="flex flex-row justify-start items-start w-full gap-3">
              <div className="flex flex-col justify-start items-start w-[50%]">
                <p>{t("name")}</p>
                <CustomInput
                  sizeInput={"medium"}
                  placeholder={""}
                  border={newContactNameErr ? "error" : undefined}
                  value={newContact.name}
                  onChange={(e) => {
                    onNameChange(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-col justify-start items-start w-full">
                <p>{"Principal"}</p>
                <CustomInput
                  sizeInput={"medium"}
                  textStyle={edit ? "disable" : "primary"}
                  disabled={edit ? true : false}
                  sufix={
                    edit ? (
                      <></>
                    ) : (
                      <button
                        className="p-0"
                        onClick={() => {
                          setClearCam(false);
                          setQRview(true);
                        }}
                      >
                        <img src={QRIcon} className="cursor-pointer" alt="search-icon" />
                      </button>
                    )
                  }
                  placeholder={""}
                  border={newContactPrinErr ? "error" : undefined}
                  value={newContact.principal}
                  onChange={(e) => {
                    onPrincipalChange(e.target.value.trim());
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <p>{t("remote.accounts")}</p>
              <CustomButton
                className="!p-1"
                onClick={async () => {
                  await searchRemotes(edit, ingressActor, newContact.principal, false);
                }}
                size={"icon"}
              >
                <SearchIcon className="w-4 h-4 !stroke-PrimaryTextColor" />
              </CustomButton>
            </div>
            <AddRemoteList
              chainRemotes={chainRemotes}
              setChainremotes={setChainremotes}
              checkIds={checkIds}
              setCheckIds={setCheckIds}
              getFtFromSub={getFtFromSub}
              nameErrs={nameErrs}
              getAssetLogo={getAssetLogo}
            />
            <div className="flex flex-row justify-end items-center w-full gap-3">
              <p className="text-TextErrorColor">{t(newContactErr)}</p>
              <CustomButton
                className="min-w-[5rem]"
                onClick={() => {
                  onAddContact(!!edit, setAddOpen);
                }}
              >
                <p>{t(edit ? "save" : "add.contact")}</p>
              </CustomButton>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );

  function onNameChange(value: string) {
    setNewContact((prev) => {
      return { ...prev, name: value };
    });
    setNewContactErr("");
    setNewContactNameErr(false);
  }

  function onPrincipalChange(value: string) {
    setNewContact((prev) => {
      return { ...prev, principal: value };
    });
    setNewContactErr("");
    setCheckIds([]);
    setNameErrs([]);
    setChainremotes([]);
    if (value.trim() !== "")
      try {
        Principal.fromText(value);
        setNewContactPrinErr(false);
      } catch {
        setNewContactPrinErr(true);
      }
    else setNewContactPrinErr(false);
  }

  async function onSuccessQR(value: string) {
    setQRview(false);
    try {
      const princ = decodeIcrcAccount(value);
      setNewContact((prev) => {
        return {
          ...prev,
          principal: princ.owner.toText(),
        };
      });
      await searchRemotes(edit, ingressActor, princ.owner.toText(), true);
    } catch {
      setNewContactErr("check.add.contact.prin.empty.err");
      setNewContactPrinErr(true);
    }
  }
};

export default AddEditHplContact;
