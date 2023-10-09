// svgs
import InfoIcon from "@assets/svg/files/info-icon.svg";
//
import { HPLAsset, HPLSubAccount } from "@redux/models/AccountModels";
import { Fragment } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { useHPL } from "@pages/hooks/hplHook";

interface HplSubaccountElemProps {
  sub: HPLSubAccount;
  idx: number;
  setEditedFt(value: HPLAsset | undefined): void;
  setAssetOpen(value: boolean): void;
}

const HplSubaccountElem = ({ sub, idx, setEditedFt, setAssetOpen }: HplSubaccountElemProps) => {
  const { hplFTs, subaccounts, selectSub, setSelSub } = useHPL(false);

  return (
    <Fragment>
      <Accordion.Item value={`sub-${idx}`}>
        <button
          className={`relative flex flex-row items-center w-full h-16 p-0 border-0 text-PrimaryColor dark:text-PrimaryColorLight cursor-pointer hover:bg-SecondaryColorLight dark:hover:bg-SecondaryColor ${
            sub.sub_account_id.toString() === selectSub?.sub_account_id.toString()
              ? "bg-SecondaryColorLight dark:bg-SecondaryColor"
              : ""
          } ${
            idx < subaccounts?.length
              ? "border-b-[0.1rem] dark:border-BorderColorThree border-BorderColorThreeLight"
              : ""
          }`}
          onClick={onSelectSub}
        >
          {sub.sub_account_id.toString() === selectSub?.sub_account_id.toString() && (
            <div className="absolute left-0 bg-[#33b2ef] h-full w-1"></div>
          )}
          <Accordion.Trigger className="flex flex-row justify-center items-center w-full">
            <div className="flex flex-row justify-start w-full h-full text-md">
              <div className="flex flex-row justify-start items-center gap-2 w-full">
                <p>LOGO</p>
                <div className="flex flex-col justify-start items-start text-md w-full">
                  <div className="flex justify-center items-center px-2 bg-slate-500 rounded-md">
                    <p className=" text-PrimaryTextColor">{sub.sub_account_id.toString()}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-row justify-start items-center">
                      <p
                        className={`${
                          sub.sub_account_id.toString() !== selectSub?.sub_account_id.toString() ? "opacity-60" : ""
                        }`}
                      >{`${sub.symbol}`}</p>
                      <div className="p-0" onClick={setEditFt}>
                        <img src={InfoIcon} className="ml-1" alt="info-icon" />
                      </div>
                    </div>
                    <p>{sub.amount.toString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Accordion.Trigger>
        </button>
      </Accordion.Item>
    </Fragment>
  );

  function onSelectSub() {
    setSelSub(sub);
  }

  function setEditFt() {
    const ft = hplFTs.find((ft) => ft.id === sub.ft);
    setEditedFt(ft);
    setAssetOpen(true);
  }
};

export default HplSubaccountElem;
