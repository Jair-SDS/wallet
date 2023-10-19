/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// svgs
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
import SendUserIcon from "@assets/svg/files/send-user-icon.svg";
import QRIcon from "@assets/svg/files/qr.svg";
//
import { HplTransactions, HplTransactionsEnum, HplTransactionsType, HplTransactionsTypeEnum } from "@/const";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { HPLSubAccount, HplTxUser } from "@redux/models/AccountModels";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChangeEvent, useState } from "react";
import { clsx } from "clsx";
import { CustomInput } from "@components/Input";

interface SelectTransferProps {
  select: HplTxUser;
  setSelect(sel: HplTxUser): void;
  subaccounts: HPLSubAccount[];
  txType: HplTransactionsType;
  setQRview(value: string): void;
}

const SelectTransfer = ({ select, setSelect, subaccounts, txType, setQRview }: SelectTransferProps) => {
  const { t } = useTranslation();
  const [subsOpen, setSubsOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  return (
    <div className="flex flex-col justify-start items-start w-full py-8 border-b border-BorderColorLight/50 dark:border-BorderColor/30 gap-3">
      <div className="flex flex-row justify-start items-center w-full bg-ThemeColorBackLight dark:bg-ThemeColorBack gap-3 px-2 rounded text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70">
        <p>{t("select")}</p>
        <RadioGroup.Root
          value={select.type}
          onValueChange={(e) => {
            handleChangeType(e as HplTransactions);
          }}
        >
          <div className="flex flex-row items-center w-full p-3 gap-2">
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
            <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-50 ">{t("account")}</p>
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
            <p className="text-PrimaryTextColorLight dark:text-PrimaryTextColor opacity-50">{t("virtual")}</p>
          </div>
        </RadioGroup.Root>
      </div>
      <div className="flex flex-col justify-start items-start w-full ">
        <p className="opacity-50">{t(txType === HplTransactionsTypeEnum.Enum.from ? "from" : "to")}</p>
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
                      <div className="p-1 flex flex-row justify-start items-center w-full gap-2 text-sm">
                        <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                          <p className=" text-PrimaryTextColor">{select.subaccount.sub_account_id}</p>
                        </div>
                        <p className="text-left">{select.subaccount.name}</p>
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
                            className="p-1 flex flex-row justify-start items-center w-full gap-2 text-sm hover:bg-HoverColorLight dark:hover:bg-HoverColor"
                            onClick={() => {
                              onSelectSub(sub);
                            }}
                          >
                            <div className="flex justify-center items-center py-1 px-3 bg-slate-500 rounded-md">
                              <p className=" text-PrimaryTextColor">{sub.sub_account_id}</p>
                            </div>
                            <p className="text-left">{sub.name}</p>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <div className="flex flex-col justify-start items-start w-full gap-2">
            <CustomInput
              sufix={
                <div className="flex flex-row justify-center items-center mx-2 gap-2">
                  {
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <img
                          src={SendUserIcon}
                          className="cursor-pointer"
                          alt="search-icon"
                          onClick={() => {
                            //
                          }}
                        />
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className=" w-[22.6rem] max-h-[calc(100vh-15rem)] scroll-y-light bg-PrimaryColorLight rounded-lg dark:bg-SecondaryColor z-[999] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-AccpetButtonColor cursor-pointer"
                          sideOffset={12}
                          align="end"
                        >
                          <DropdownMenu.Arrow
                            className=" fill-AccpetButtonColor rounded-lg dark:fill-AccpetButtonColor"
                            width={10}
                            hanging={10}
                          />
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  }

                  <img
                    src={QRIcon}
                    className="cursor-pointer"
                    alt="search-icon"
                    onClick={() => {
                      setQRview(txType);
                    }}
                  />
                </div>
              }
              intent={"secondary"}
              placeholder={"Principal"}
              compOutClass="mb-1"
              value={select.principal}
              onChange={onChangePrincipal}
              sizeInput="small"
              border={"secondary"}
            />
            <CustomInput
              compOutClass="!w-1/3"
              intent={"secondary"}
              placeholder={t("index")}
              value={select.vIdx}
              onChange={onChangeIdx}
              sizeInput="small"
              border={"secondary"}
            />
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
  function onSelectSub(sub: HPLSubAccount) {
    setSelect({ ...select, subaccount: sub, principal: "", vIdx: "" });
    setSubsOpen(false);
  }
  function onChangePrincipal(e: ChangeEvent<HTMLInputElement>) {
    setSelect({
      ...select,
      principal: e.target.value,
    });
  }
  function onChangeIdx(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "" || /^\+?([0-9]\d*)$/.test(value))
      setSelect({
        ...select,
        vIdx: e.target.value === "" ? "" : Number(e.target.value).toString(),
      });
  }
};

export default SelectTransfer;
