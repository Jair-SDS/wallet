/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// svgs
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import QRIcon from "@assets/svg/files/qr.svg";
//
import { HplTransactions, HplTransactionsEnum, HplTransactionsType, HplTransactionsTypeEnum } from "@/const";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { HPLAsset, HPLSubAccount, HplContact, HplTxUser } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChangeEvent, useState } from "react";
import { clsx } from "clsx";
import { CustomInput } from "@components/Input";
import SelectTxRemote from "./SelectTxRemote";

interface SelectTransferProps {
  select: HplTxUser;
  setSelect(sel: HplTxUser): void;
  subaccounts: HPLSubAccount[];
  hplContacts: HplContact[];
  txType: HplTransactionsType;
  manual: boolean;
  setManual(value: boolean): void;
  setQRview(value: string): void;
  getAssetLogo(id: string): string;
  getFtFromSub(id: string): HPLAsset;
}

const SelectTransfer = ({
  select,
  setSelect,
  subaccounts,
  hplContacts,
  txType,
  manual,
  setManual,
  setQRview,
  getAssetLogo,
  getFtFromSub,
}: SelectTransferProps) => {
  const { t } = useTranslation();
  const [subsOpen, setSubsOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  return (
    <div className="flex flex-col justify-start items-start w-full py-8 border-b border-BorderColorLight/50 dark:border-BorderColor/30 gap-3">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="opacity-50">{t(txType === HplTransactionsTypeEnum.Enum.from ? "from" : "to")}</p>
        <div className="flex flex-row justify-start items-center bg-ThemeColorBackLight dark:bg-ThemeColorBack gap-3 px-6 rounded text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70">
          <p>{t("select")}</p>
          <RadioGroup.Root
            value={select.type}
            onValueChange={(e) => {
              handleChangeType(e as HplTransactions);
            }}
          >
            <div className="flex flex-row items-center w-full px-3 py-1 gap-2">
              <RadioGroup.Item
                className={`w-4 h-4 rounded-full border-2  outline-none p-0 ${
                  select.type === HplTransactionsEnum.Enum.SUBACCOUNT
                    ? "border-RadioCheckColor"
                    : "border-RadioNoCheckColorLight"
                }`}
                value={HplTransactionsEnum.Enum.SUBACCOUNT}
                id="r-light"
              >
                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-RadioCheckColor" />
              </RadioGroup.Item>
              <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-50 ">{t("own")}</p>
              <RadioGroup.Item
                className={`w-4 h-4 rounded-full border-2 ml-2  outline-none p-0 ${
                  select.type === HplTransactionsEnum.Enum.VIRTUAL
                    ? "border-RadioCheckColor"
                    : "border-RadioNoCheckColorLight"
                }`}
                value={HplTransactionsEnum.Enum.VIRTUAL}
                id="r-light"
              >
                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-RadioCheckColor" />
              </RadioGroup.Item>
              <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-50">{t("remote")}</p>
            </div>
          </RadioGroup.Root>
        </div>
      </div>
      {select.type === HplTransactionsEnum.Enum.VIRTUAL && (
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row justify-start items-center gap-2">
            <p>{t("manual")}</p>
            <div
              className={`flex flex-row w-9 h-4 rounded-full relative cursor-pointer items-center ${
                manual ? "bg-[#26A17B]" : "bg-[#7E7D91]"
              }`}
              onClick={onManualToggle}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-spacing duration-300 ${manual ? "ml-5" : "ml-1"}`}
              ></div>
            </div>
          </div>
          {manual && (
            <img
              src={QRIcon}
              className="cursor-pointer"
              alt="search-icon"
              onClick={() => {
                setQRview(txType);
              }}
            />
          )}
        </div>
      )}
      <div className="flex flex-col justify-start items-start w-full ">
        {select.type === HplTransactionsEnum.Enum.SUBACCOUNT ? (
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
                <div className="flex flex-row justify-start items-center w-full px-2 py-1 border border-BorderColorTwoLight dark:border-BorderColorTwo rounded-md bg-SecondaryColorLight dark:bg-SecondaryColor">
                  {!select.subaccount ? (
                    <div className="flex flex-row justify-between items-center w-full">
                      <p className="opacity-60">{t("select.account")}</p>
                      <img
                        src={ChevIcon}
                        style={{ width: "2rem", height: "2rem" }}
                        alt="chevron-icon"
                        className={`${subsOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="p-1 flex flex-row justify-start items-center w-full gap-4 text-sm">
                        <img src={getAssetLogo(select.subaccount.ft)} className="w-8 h-8" alt="info-icon" />
                        <div className="flex flex-col justify-start items-start gap-1">
                          <div className="flex flex-row justify-start items-center gap-2">
                            <div className="flex justify-center items-center  px-1 bg-slate-500 rounded">
                              <p className=" text-PrimaryTextColor">{select.subaccount.sub_account_id}</p>
                            </div>
                            <p className="text-left">{select.subaccount.name}</p>
                          </div>
                          <p className="opacity-70">{`${select.subaccount.amount} ${
                            getFtFromSub(select.subaccount.ft).symbol
                          }`}</p>
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
                    {subaccounts
                      .filter((sub) => {
                        const key = searchKey.toLowerCase();
                        return sub.name.toLowerCase().includes(key) || sub.sub_account_id.toString().includes(key);
                      })
                      .map((sub, k) => {
                        return (
                          <button
                            key={k}
                            className="p-1 flex flex-row justify-start items-center w-full gap-4 text-sm hover:bg-SelectRowColor/10 border-b border-b-BorderColor/10"
                            onClick={() => {
                              onSelectSub(sub);
                            }}
                          >
                            <img src={getAssetLogo(sub.ft)} className="w-8 h-8" alt="info-icon" />
                            <div className="flex flex-col justify-start items-start gap-1">
                              <div className="flex flex-row justify-start items-center gap-2">
                                <div className="flex justify-center items-center  px-1 bg-slate-500 rounded">
                                  <p className=" text-PrimaryTextColor">{sub.sub_account_id}</p>
                                </div>
                                <p className="text-left">{sub.name}</p>
                              </div>
                              <p className="opacity-70">{`${sub.amount} ${getFtFromSub(sub.ft).symbol}`}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <SelectTxRemote
            select={select}
            setSelect={setSelect}
            manual={manual}
            getAssetLogo={getAssetLogo}
            getFtFromSub={getFtFromSub}
            hplContacts={hplContacts}
          />
        )}
        {(select.subaccount || select.remote) && (
          <div className="flex flex-row justify-end items-center w-full mt-1">
            <p className="text-SelectRowColor underline cursor-pointer" onClick={onClear}>
              {t("clear")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
  function handleChangeType(value: HplTransactions) {
    setSelect({
      ...select,
      type: value,
      subaccount: value === HplTransactionsEnum.Enum.SUBACCOUNT ? select.subaccount : undefined,
    });
  }
  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function onClear() {
    setSelect({ ...select, subaccount: undefined, principal: "", vIdx: "", remote: undefined });
  }
  function onSelectSub(sub: HPLSubAccount) {
    setSelect({ ...select, subaccount: sub, principal: "", vIdx: "", remote: undefined });
    setSubsOpen(false);
  }
  function onManualToggle() {
    setSelect({ ...select, subaccount: undefined, principal: "", vIdx: "", remote: undefined });
    setManual(!manual);
  }
};

export default SelectTransfer;
