// svgs
import ChevronRightIcon from "@assets/svg/files/chevron-right-icon.svg";
import ChevronRightDarkIcon from "@assets/svg/files/chevron-right-dark-icon.svg";
//
import { HPLSubAccount } from "@redux/models/AccountModels";
import { Fragment } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { GeneralHook } from "../hooks/generalHook";
import { ThemeHook } from "@hooks/themeHook";
import { ThemesEnum } from "@/const";
import { getFirstNChars } from "@/utils";

interface HplSubaccountElemProps {
  asset: HPLSubAccount;
  idx: number;
  acordeonIdx: string;
}

const HplSubaccountElem = ({ asset, idx, acordeonIdx }: HplSubaccountElemProps) => {
  const { theme } = ThemeHook();
  const { subaccounts, selectedAsset } = GeneralHook();

  return (
    <Fragment>
      <Accordion.Item value={`asset-${idx}`}>
        <div
          className={`relative flex flex-row items-center w-full h-16 text-PrimaryColor dark:text-PrimaryColorLight cursor-pointer hover:bg-SecondaryColorLight dark:hover:bg-SecondaryColor ${
            asset.sub_account_id.toString() === selectedAsset?.tokenSymbol
              ? "bg-SecondaryColorLight dark:bg-SecondaryColor"
              : ""
          } ${
            idx < subaccounts?.length
              ? "border-b-[0.1rem] dark:border-BorderColorThree border-BorderColorThreeLight"
              : ""
          }`}
        >
          {asset.sub_account_id.toString() === selectedAsset?.tokenSymbol && (
            <div className="absolute left-0 bg-[#33b2ef] h-full w-1"></div>
          )}
          <Accordion.Trigger className="flex flex-row justify-center items-center w-full">
            <div className={"flex flex-row justify-between w-full h-full text-md"}>
              <div className="flex flex-row justify-start items-center gap-2">
                {/* {getAssetIcon(IconTypeEnum.Enum.ASSET, asset?.tokenSymbol, asset.logo)} */}
                <p>LOGO</p>
                <div className="flex flex-col justify-start items-start">
                  <p>{`SubId: ${getFirstNChars(asset.name ? asset.name : asset.sub_account_id.toString(), 18)} ${
                    asset.virtuals.length > 0 ? ` - Virtuals (${asset.virtuals.length})` : ""
                  }`}</p>
                  <div className="flex flex-row justify-start items-center">
                    <p
                      className={`${
                        asset.sub_account_id.toString() !== selectedAsset?.tokenSymbol ? "opacity-60" : ""
                      }`}
                    >{`${asset.symbol}`}</p>
                    {/* <div
                      className="p-0"
                      onClick={() => {
                        setAssetInfo(asset);
                        setAssetOpen(true);
                      }}
                    >
                      <img src={InfoIcon} className="ml-1" alt="info-icon" />
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-end">
                {/* <p>{`${toFullDecimal(getFullTokenAmount().token, asset.decimal)} ${asset.symbol}`}</p>
                <p
                  className={`${asset?.tokenSymbol !== selectedAsset?.tokenSymbol ? "opacity-60" : ""}`}
                >{`≈ $${getFullTokenAmount().currency.toFixed(2)}`}</p> */}
                <p>{asset.amount.toString()}</p>
              </div>
            </div>
            <img
              src={theme === ThemesEnum.enum.dark ? ChevronRightIcon : ChevronRightDarkIcon}
              className={`${asset.virtuals.length === 0 ? "invisible" : ""} ${
                acordeonIdx === `asset-${idx}` ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"
              } ml-3`}
              alt="chevron-icon"
            />
          </Accordion.Trigger>
        </div>
        {asset.virtuals.length > 0 && (
          <Accordion.Content>
            <div
              className={`flex flex-col justify-start items-end ${
                idx < subaccounts?.length
                  ? "border-b-[0.1rem] dark:border-BorderColorThree border-BorderColorThreeLight"
                  : ""
              }`}
            >
              {asset.virtuals.map((va, k) => {
                return (
                  <div key={k} className="flex flex-row justify-between items-start w-full pl-16 pr-10 text-md py-2">
                    <p>{`VirID: ${va.virt_sub_acc_id.toString()}`}</p>
                    <p>{va.amount.toString()}</p>
                  </div>
                );
              })}
              {/* {asset?.virtuals.map((subAccount: SubAccount, subIdx: number) => {
                return (
                  <AccountElement
                    key={subIdx}
                    subAccount={subAccount}
                    symbol={asset.symbol}
                    name={name}
                    setName={setName}
                    editNameId={editNameId}
                    setEditNameId={setEditNameId}
                    tokenIndex={idx}
                    newSub={false}
                    setNewSub={setNewSub}
                    tokens={tokens}
                    subaccountId={subIdx}
                  ></AccountElement>
                );
              })} */}
            </div>
          </Accordion.Content>
        )}
      </Accordion.Item>
      {/* <Modal
        width="w-[18rem]"
        padding="py-5 px-4"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
        open={newSub ? true : false}
      >
        <div className="reative flex flex-col justify-start items-start w-full gap-2">
          <CloseIcon
            className="absolute top-6 right-5 cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
            onClick={() => {
              setNewSub(undefined);
              setHexChecked(false);
            }}
          />
          <p className="">{t("add.subacc")}</p>
          <CustomInput
            intent={"primary"}
            border={newErr.name ? "error" : "primary"}
            placeholder={t("name.sub.account")}
            value={newSub?.name || ""}
            sizeComp="small"
            sizeInput="small"
            inputClass="!py-1"
            autoFocus
            onChange={(e: { target: { value: string } }) => {
              setNewSub((prev) => {
                if (prev) return { ...prev, name: e.target.value };
              });
              setNewErr((prev) => {
                return { idx: prev.idx, name: false };
              });
            }}
            onKeyUp={(e) => {
              if (e.nativeEvent.key === "Enter") {
                onEnter();
              }
            }}
          />
          <button
            className="p-0 flex flex-row gap-2"
            onClick={() => {
              if (hexChecked) {
                const lowestMissing = getLowestMissing(usedIdxs);
                setNewSub((prev) => {
                  if (prev) return { ...prev, sub_account_id: lowestMissing.toString(16) };
                });
                setNewErr((prev) => {
                  return { name: prev.name, idx: false };
                });
              }
              setHexChecked((prev) => !prev);
            }}
          >
            <CustomCheck className="border-BorderColorLight dark:border-BorderColor" checked={hexChecked} />
            <p className="text-sm">{t("hex.check")}</p>
          </button>
          {hexChecked && (
            <CustomInput
              intent={"primary"}
              border={newErr.idx ? "error" : "primary"}
              placeholder={t("sub-acc")}
              value={newSub?.sub_account_id || ""}
              sizeComp="small"
              sizeInput="small"
              inputClass="!py-1"
              onChange={(e: { target: { value: string } }) => {
                if (checkHexString(e.target.value))
                  setNewSub((prev) => {
                    if (prev) return { ...prev, sub_account_id: e.target.value.trim() };
                  });
                setNewErr((prev) => {
                  return { name: prev.name, idx: false };
                });
              }}
              onKeyUp={(e) => {
                if (e.nativeEvent.key === "Enter") {
                  onEnter();
                }
              }}
              onKeyDown={(e) => {
                if (!asciiHex.includes(e.key)) {
                  e.preventDefault();
                }
                if (newSub?.sub_account_id.includes("0x") || newSub?.sub_account_id.includes("0X")) {
                  if (e.key === "X" || e.key == "x") {
                    e.preventDefault();
                  }
                }
              }}
            />
          )}
          <div className="flex flex-row justify-end items-center w-full">
            <CustomButton
              size={"small"}
              className="min-w-[5rem]"
              onClick={() => {
                onEnter();
              }}
            >
              <p>{t("add")}</p>
            </CustomButton>
          </div>
        </div>
      </Modal> */}
    </Fragment>
  );
};

export default HplSubaccountElem;
