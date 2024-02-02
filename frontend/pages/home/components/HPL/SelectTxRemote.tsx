// svgs
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
//
import { ChangeEvent, Fragment, useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CustomInput } from "@components/Input";
import { HPLAsset, HplContact, HplRemote, HplTxUser } from "@redux/models/AccountModels";
import { clsx } from "clsx";
import { checkPxlCode, getContactColor, getDecimalAmount, getInitialFromName, getOwnerInfoFromPxl } from "@/utils";
import { useTranslation } from "react-i18next";
import AssetSymbol from "@components/AssetSymbol";
import { HplTransactionsType, HplTransactionsTypeEnum } from "@/const";
import { Principal } from "@dfinity/principal";
import { isValid } from "zod";

interface SelectTxRemoteProps {
  select: HplTxUser;
  setSelect(sel: HplTxUser): void;
  manual: boolean;
  getAssetLogo(id: string): string;
  getFtFromSub(id: string): HPLAsset;
  validateData(selection: string, link?: HplTxUser): Promise<{ ftId: string; valid: boolean }>;
  validateAssetMatch(data?: {
    selection: string;
    link: HplTxUser;
  }): Promise<{ fromFtId: string; toFtId: string; valid: boolean }>;
  setManualFt(value: string | undefined): void;
  hplContacts: HplContact[];
  otherAsset?: string;
  otherId?: string;
  otherPrincipal?: string;
  txType: HplTransactionsType;
  getPrincipalFromOwnerId(value: bigint): Promise<Principal | undefined>;
  getAssetId(data: HplTxUser): Promise<string>;
  setErrMsg(msg: string): void;
}

const SelectTxRemote = ({
  manual,
  select,
  setSelect,
  getAssetLogo,
  getFtFromSub,
  validateData,
  hplContacts,
  otherAsset,
  otherId,
  otherPrincipal,
  txType,
  validateAssetMatch,
  setManualFt,
  getPrincipalFromOwnerId,
  setErrMsg,
}: SelectTxRemoteProps) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [subsOpen, setSubsOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [principalErr, setPrincipalErr] = useState(false);

  useEffect(() => {
    setPrincipalErr(false);
    setManualFt(undefined);
    setCode("");
  }, [manual]);

  return (
    <Fragment>
      {manual ? (
        <div className="flex flex-col justify-start items-start w-full gap-2">
          <CustomInput
            intent={"secondary"}
            placeholder={t("virtual")}
            compOutClass="mb-1"
            value={code}
            onChange={onChangeCode}
            sizeInput="small"
            border={principalErr ? "error" : "secondary"}
            onBlur={() => {
              onLeaveFocus();
            }}
          />
        </div>
      ) : (
        <DropdownMenu.Root
          open={subsOpen}
          onOpenChange={(e: boolean) => {
            setSubsOpen(e);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <div
              className={clsx(
                "flex justify-start items-start",
                "border-BorderColorLight dark:border-BorderColor",
                "cursor-pointer",
                "!w-full",
                "pr-0",
              )}
            >
              <div className="flex flex-row justify-start items-center w-full px-2 py-1 border border-BorderColorTwoLight dark:border-BorderColorTwo rounded-md bg-PrimaryColorLight dark:bg-SecondaryColor">
                {!select.remote ? (
                  <div className="flex flex-row justify-between items-center w-full">
                    <p className="opacity-60">{t("select.remote")}</p>
                    <img
                      src={ChevIcon}
                      style={{ width: "2rem", height: "2rem" }}
                      alt="chevron-icon"
                      className={`${subsOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                ) : (
                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="p-1 flex flex-row justify-start items-center w-full gap-4 text-md">
                      <div
                        className={`flex justify-center items-center !min-w-[2rem] w-8 h-8 rounded-md ${getContactColor(
                          0,
                        )}`}
                      >
                        <p className="text-PrimaryTextColor">{getInitialFromName(select.remote.name, 1)}</p>
                      </div>
                      <div className="flex flex-col justify-start items-start w-full">
                        <p>{select.remote.name}</p>
                        <div className="flex flex-row justify-start items-center gap-2">
                          <img src={getAssetLogo(select.remote.ftIndex)} className="w-4 h-4" alt="info-icon" />
                          <AssetSymbol
                            ft={getFtFromSub(select.remote.ftIndex)}
                            textClass="dark:text-RemoteAmount dark:opacity-60 text-AmountRemote"
                            sufix={
                              <p className="dark:text-RemoteAmount dark:opacity-60 text-AmountRemote">
                                {`${getDecimalAmount(
                                  select.remote.amount,
                                  getFtFromSub(select.remote.ftIndex).decimal,
                                )}`}{" "}
                              </p>
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <img
                      src={ChevIcon}
                      style={{ width: "2rem", height: "2rem" }}
                      alt="chevron-icon"
                      className={`${subsOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="text-lg bg-PrimaryColorLight w-[25rem] rounded-lg dark:bg-SecondaryColor z-[2000] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-SelectRowColor"
              sideOffset={5}
              align="end"
            >
              <div className="flex flex-col justify-start items-start w-full p-1 gap-2">
                <CustomInput
                  prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
                  sizeInput={"small"}
                  intent={"secondary"}
                  placeholder=""
                  compOutClass=""
                  value={searchKey}
                  onChange={onSearchChange}
                />
                <div className="flex flex-col justify-start items-start w-full scroll-y-light max-h-[calc(100vh-30rem)]">
                  {getRemotesToSelect()
                    .filter((rmt) => {
                      const key = searchKey.toLowerCase();
                      return (
                        (rmt.remote.name.toLowerCase().includes(key) || rmt.remote.ftIndex.includes(key)) &&
                        (!otherAsset || otherAsset === rmt.remote.ftIndex) &&
                        (!otherId || !(otherId === rmt.remote.index && otherPrincipal === rmt.principal))
                      );
                    })
                    .map(({ remote: rmt, principal: prin }, k) => {
                      const ft = getFtFromSub(rmt.ftIndex);
                      return (
                        <button
                          key={k}
                          className="p-1 flex flex-row justify-start items-center w-full gap-4 text-md hover:bg-SelectRowColor/10 border-b border-b-BorderColor/10"
                          onClick={() => {
                            onSelectRemote(rmt, prin);
                          }}
                        >
                          <div className="p-1 flex flex-row justify-start items-center w-full gap-4">
                            <div
                              className={`flex justify-center items-center !min-w-[2rem] w-8 h-8 rounded-md ${getContactColor(
                                0,
                              )}`}
                            >
                              <p className="text-PrimaryTextColor">{getInitialFromName(rmt.name, 1)}</p>
                            </div>
                            <div className="flex flex-col justify-start items-start w-full">
                              <p>{rmt.name}</p>
                              <div className="flex flex-row justify-start items-center gap-2">
                                <img src={getAssetLogo(rmt.ftIndex)} className="w-4 h-4" alt="info-icon" />

                                <AssetSymbol
                                  ft={ft}
                                  textClass="opacity-60"
                                  sufix={<p className="opacity-60">{`${getDecimalAmount(rmt.amount, ft.decimal)}`}</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </Fragment>
  );
  function onChangeCode(e: ChangeEvent<HTMLInputElement>) {
    setCode(e.target.value.trim());
    setSelect({ ...select, code: e.target.value.trim() });
    setManualFt(undefined);
    if (e.target.value.trim() === "") setPrincipalErr(false);
    else if (checkPxlCode(e.target.value.trim())) {
      setPrincipalErr(false);
    } else {
      setPrincipalErr(true);
    }
  }

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function getRemotesToSelect() {
    const auxRemotes: { remote: HplRemote; principal: string }[] = [];
    hplContacts.map((cntc) => {
      cntc.remotes.map((rmt) => {
        auxRemotes.push({ principal: cntc.principal, remote: { ...rmt, name: `${cntc.name} [${rmt.name}]` } });
      });
    });
    return auxRemotes;
  }
  function onSelectRemote(rmt: HplRemote, prin: string) {
    setSelect({ ...select, subaccount: undefined, principal: prin, vIdx: rmt.index, remote: rmt });
    setSubsOpen(false);
  }
  async function onLeaveFocus() {
    if (code.length > 2) {
      const ownerInfo = getOwnerInfoFromPxl(code);
      if (ownerInfo) {
        const princ = await getPrincipalFromOwnerId(ownerInfo.ownerId);
        if (princ) {
          const linkAcc = {
            ...select,
            principal: princ.toText(),
            vIdx: ownerInfo.linkId,
            subaccount: undefined,
            remote: undefined,
          };
          setSelect(linkAcc);
          const valid = await checkValidOnLeave(linkAcc);
          if (!valid) setPrincipalErr(true);
        } else {
          setPrincipalErr(true);
          setErrMsg(t(txType === HplTransactionsTypeEnum.Enum.from ? "remote.no.yours.from" : "remote.no.yours.to"));
        }
      } else {
        setPrincipalErr(true);
      }
    }
  }
  async function checkValidOnLeave(linkAcc: HplTxUser) {
    const { valid, ftId } = await validateData(txType, linkAcc);
    if (valid) {
      setManualFt(ftId);
      const { valid: isValid } = await validateAssetMatch({ selection: txType, link: linkAcc });
      return valid && isValid;
    } else return false;
  }
};

export default SelectTxRemote;
