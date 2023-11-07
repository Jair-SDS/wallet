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
import { formatHplRemotes } from "@/utils";
import { CustomCheck } from "@components/CheckBox";
import { HplContact, HplRemote } from "@redux/models/AccountModels";
import dayjs from "dayjs";

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
    checkPrincipalValid,
    checkUsedPrincipal,
    chainRemotes,
    setChainremotes,
    hplContacts,
    saveHplContacts,
  } = useHplContacts();
  const { ingressActor, getAssetLogo, getFtFromSub } = useHPL(false);
  const [qrView, setQRview] = useState(false);
  const [clearCam, setClearCam] = useState(false);
  const [checkIds, setCheckIds] = useState<string[]>([]);
  const [nameErrs, setNameErrs] = useState<number[]>([]);

  useEffect(() => {
    const fetchRemotes = async () => {
      if (edit) {
        const remotesInfo = await ingressActor.remoteAccountInfo({
          idRange: [Principal.fromText(edit.principal), BigInt(0), []],
        });
        const remoteState = (
          await ingressActor.state({
            ftSupplies: [],
            virtualAccounts: [],
            accounts: [],
            remoteAccounts: [{ idRange: [Principal.fromText(edit.principal), BigInt(0), []] }],
          })
        ).remoteAccounts;
        setNewContact(edit);
        if (remotesInfo.length === 0 || remoteState.length === 0) setNewContactErr("no.remotes.found");
        else {
          const auxRemotes: HplRemote[] = [];
          const actorRemotes = formatHplRemotes(remotesInfo, remoteState);
          console.log("actorRemotes", actorRemotes);
          console.log("editRemotes", edit.remotes);

          const actorIds: string[] = [];
          actorRemotes.map((actorRemote) => {
            actorIds.push(actorRemote.index);
            const founded = edit.remotes.find((editRemote) => actorRemote.index === editRemote.index);
            founded &&
              setCheckIds((prev) => {
                return [...prev, founded.index];
              });
            auxRemotes.push(founded ? { ...actorRemote, name: founded.name } : actorRemote);
          });
          auxRemotes.map((editRemote) => {
            if (!actorIds.includes(editRemote.index)) {
              auxRemotes.push({ ...editRemote, status: "deleted" });
            }
          });
          setChainremotes(
            auxRemotes.sort((a, b) => {
              return Number(a.index) - Number(b.index);
            }),
          );
        }
      }
    };
    fetchRemotes();
  }, [edit]);

  return (
    <Fragment>
      <div className="reative flex flex-col justify-start items-start w-full gap-4 text-md">
        <CloseIcon
          className="absolute top-5 right-5 cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={() => {
            setAddOpen(false);
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
                    onPrincipalChange(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <p>{t("remote.accounts")}</p>
              <CustomButton
                className="!p-1"
                onClick={async () => {
                  await searchRemotes(newContact.principal, false);
                }}
                size={"icon"}
              >
                <SearchIcon className="w-4 h-4 !stroke-PrimaryTextColor" />
              </CustomButton>
            </div>
            <div className="flex flex-row justify-start items-start w-full h-72 scroll-y-light rounded-sm bg-ThirdColorLight dark:bg-ThirdColor gap-3">
              {chainRemotes.length > 0 ? (
                <table className="w-full text-md">
                  <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo text-PrimaryTextColor/70 sticky top-0 z-[1]">
                    <tr>
                      <th className="p-2 text-center w-[11%] bg-ThirdColorLight dark:bg-ThirdColor">
                        <p>{"ID"}</p>
                      </th>
                      <th className="p-2 text-left w-[35%] bg-ThirdColorLight dark:bg-ThirdColor">
                        <p>{t("name")}</p>
                      </th>
                      <th className="p-2 text-center w-[17%] bg-ThirdColorLight dark:bg-ThirdColor">
                        <p>{t("asset")} ID</p>
                      </th>
                      <th className="p-2 text-left w-[30%] bg-ThirdColorLight dark:bg-ThirdColor">
                        <p>{t("asset.name")}</p>
                      </th>
                      <th className="p-2 text-center w-[7%] bg-ThirdColorLight dark:bg-ThirdColor">
                        <div className="flex flex-row justify-center items-center">
                          <button className="flex flex-row justify-center items-center p-0" onClick={onAllCheck}>
                            <CustomCheck
                              className="border-BorderColorLight dark:border-BorderColor"
                              checked={checkIds.length === chainRemotes.length}
                            />
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chainRemotes.map((rmt, k) => {
                      const ft = getFtFromSub(rmt.ftIndex);
                      const checked = checkIds.includes(rmt.index);
                      const expired = rmt.expired === 0 ? false : dayjs(rmt.expired).isBefore(dayjs());
                      const bg = rmt.status === "deleted" ? "bg-[#B0736F]" : expired ? "bg-[#7C7C7C]" : "";
                      return (
                        <tr key={k} className={`${checked ? "bg-SelectRowColor/20" : ""}`}>
                          <td className="p-2 text-center">
                            <div className="relative flex flex-row justify-center items-center w-full">
                              <div className={`absolute left-0 w-2 h-full rounded-full ${bg}`}></div>
                              <p>{rmt.index}</p>
                            </div>
                          </td>
                          <td>
                            <CustomInput
                              key={k}
                              compOutClass="p-2"
                              inputClass="!py-1"
                              sizeInput={"medium"}
                              sizeComp={"small"}
                              intent={"primary"}
                              border={nameErrs.includes(k) ? "error" : undefined}
                              value={rmt.name}
                              onChange={(e) => {
                                onChangeRmtName(e.target.value, k);
                              }}
                            />
                          </td>
                          <td>
                            <div className="flex flex-row justify-center items-center gap-2">
                              <img src={getAssetLogo(rmt.ftIndex)} className="w-5 h-5" alt="info-icon" />
                              <div className="flex justify-center items-center  px-1 bg-slate-500 rounded-md">
                                <p className="text-md text-PrimaryTextColor">{rmt.ftIndex}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2">
                            <p>{`${ft.name ? ft.name : "-"} / ${ft.symbol ? ft.symbol : "-"}`}</p>
                          </td>
                          <td>
                            <div className="flex flex-row justify-center items-center">
                              <button
                                className="flex flex-row justify-center items-center p-0"
                                onClick={() => {
                                  checkRemoteIds(rmt.index);
                                }}
                              >
                                <CustomCheck
                                  className="border-BorderColorLight dark:border-BorderColor"
                                  checked={checked}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex flex-row justify-end items-center w-full gap-3">
              <p className="text-TextErrorColor">{t(newContactErr)}</p>
              <CustomButton className="min-w-[5rem]" onClick={onAddContact}>
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
    setNewContactPrinErr(false);
    setCheckIds([]);
    setNameErrs([]);
    setChainremotes([]);
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
      await searchRemotes(princ.owner.toText(), true);
    } catch {
      setNewContactErr("check.add.contact.prin.empty.err");
      setNewContactPrinErr(true);
    }
  }

  async function searchRemotes(principal: string, fromQr: boolean) {
    if (!fromQr) {
      if (principal.trim() === "") {
        setNewContactErr("check.add.contact.prin.empty.err");
        setNewContactPrinErr(true);
        return;
      } else if (!checkPrincipalValid(principal)) {
        console.log("a?");

        setNewContactErr("check.add.contact.prin.err");
        setNewContactPrinErr(true);
        return;
      } else if (!checkUsedPrincipal(principal)) {
        setNewContactErr("used.contact.prin.err");
        setNewContactPrinErr(true);
        return;
      }
    }
    try {
      const remotesInfo = await ingressActor.remoteAccountInfo({
        idRange: [Principal.fromText(principal), BigInt(0), []],
      });
      const remoteState = (
        await ingressActor.state({
          ftSupplies: [],
          virtualAccounts: [],
          accounts: [],
          remoteAccounts: [{ idRange: [Principal.fromText(principal), BigInt(0), []] }],
        })
      ).remoteAccounts;
      if (remotesInfo.length === 0 || remoteState.length === 0) setNewContactErr("no.remotes.found");
      else {
        setChainremotes(formatHplRemotes(remotesInfo, remoteState));
      }
    } catch (e) {
      setNewContactErr("no.remotes.found");
    }
  }

  function onAllCheck() {
    if (chainRemotes.length === checkIds.length) setCheckIds([]);
    else {
      setCheckIds(
        chainRemotes.map((rmt) => {
          return rmt.index;
        }),
      );
    }
  }

  function onChangeRmtName(name: string, k: number) {
    const auxRmts = chainRemotes.map((rmt, j) => {
      if (k === j) return { ...rmt, name: name };
      else return rmt;
    });
    setChainremotes(auxRmts);
  }

  function checkRemoteIds(index: string) {
    if (checkIds.includes(index)) {
      setCheckIds(
        checkIds.filter((id) => {
          return index !== id;
        }),
      );
    } else {
      setCheckIds([...checkIds, index]);
    }
  }

  function onAddContact() {
    let validContact = true;
    let err = { msg: "", name: false, prin: false };
    if (newContact.name.trim() === "" && newContact.principal.trim() === "") {
      validContact = false;
      err = { msg: "check.add.contact.both.err", name: true, prin: true };
    } else {
      if (newContact.name.trim() === "") {
        validContact = false;
        err = { ...err, msg: "check.add.contact.name.err", name: true };
      }
      if (newContact.principal.trim() === "") {
        validContact = false;
        err = { ...err, msg: "check.add.contact.prin.empty.err", prin: true };
      } else if (!checkPrincipalValid(newContact.principal) || (!checkUsedPrincipal(newContact.principal) && !edit)) {
        validContact = false;
        err = { ...err, msg: "check.add.contact.prin.err", prin: true };
      } else if (checkIds.length === 0) {
        validContact = false;
        err = { ...err, msg: "check.add.contact.no.remotes.err" };
      }
    }

    setNewContactErr(err.msg);
    setNewContactNameErr(err.name);
    setNewContactPrinErr(err.prin);

    if (validContact) {
      let auxConatct: HplContact[] = [];
      const selRemotes = chainRemotes.filter((rmt) => {
        return checkIds.includes(rmt.index);
      });
      if (edit) {
        hplContacts.map((cntc) => {
          if (cntc.principal === newContact.principal) auxConatct.push({ ...newContact, remotes: selRemotes });
          else auxConatct.push(cntc);
        });
      } else {
        auxConatct = [...hplContacts, { ...newContact, remotes: selRemotes }];
      }
      saveHplContacts(auxConatct);
      setAddOpen(false);
    }
  }
};

export default AddEditHplContact;
