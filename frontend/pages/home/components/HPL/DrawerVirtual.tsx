// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/input";
import { useHPL } from "@pages/hooks/hplHook";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HPLVirtualData, HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { ThemeHook } from "@pages/hooks/themeHook";
import { CustomCheck } from "@components/checkbox";
import { CustomButton } from "@components/button";
import { CustomCopy } from "@components/tooltip";
import dayjs from "dayjs";
import { Principal } from "@dfinity/principal";
import { AccountHook } from "@pages/hooks/accountHook";
import { LoadingLoader } from "@components/loader";
import BackingSelector from "./BackingSelector";
import AccesBySelector from "./AccesBySelector";
import AssetSymbol from "@components/AssetSymbol";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { idlFactory as HplMintIDLFactory } from "@candid/HplMint/candid.did";
import { Actor } from "@dfinity/agent";
import { db } from "@/database/db";
import { getDecimalAmount } from "@common/utils/number";
import { shortAddress } from "@common/utils/icrc";
import { getHoleAmount } from "@common/utils/amount";
import { getPxlCode } from "@common/utils/hpl";

interface DrawerVirtualProps {
  setDrawerOpen(value: boolean): void;
  drawerOpen: boolean;
}

const DrawerVirtual = ({ setDrawerOpen, drawerOpen }: DrawerVirtualProps) => {
  const { t } = useTranslation();
  const { theme } = ThemeHook();
  const { authClient, userAgent } = AccountHook();
  const {
    ingressActor,
    selectSub,
    selectVt,
    setSelVt,
    newVt,
    setNewVt,
    getFtFromVt,
    hplVTsData,
    editVtData,
    editLink,
    addLink,
    addVt,
    changeVtName,
    expiration,
    setExpiration,
    onNameChange,
    onAccesChange,
    onBalanceChange,
    onChangeExpirationCheck,
    onTimePickerClic,
    onDateChange,
    accesErr,
    setAccesErr,
    ownerId,
    ownersActor,
    editOwnerId,
  } = useHPL(false);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (drawerOpen) {
      setLoading(false);
      setErrMsg("");
      setExpiration(true);
      if (selectVt) {
        setNewVt({
          ...selectVt,
          amount: getDecimalAmount(selectVt.amount, getFtFromVt(selectVt.backing).decimal, true),
        });
        setExpiration(selectVt.expiration === 0);
      } else if (selectSub)
        setNewVt((prev) => {
          return { ...prev, backing: selectSub.sub_account_id };
        });
    } else {
      setNewVt({
        virt_sub_acc_id: "",
        name: "",
        amount: "",
        currency_amount: "",
        expiration: 0,
        accesBy: "",
        backing: "",
        code: "",
        isMint: false,
      });
    }
  }, [drawerOpen, selectVt]);

  return (
    <div className="flex flex-col justify-start items-start bg-PrimaryColorLight dark:bg-SideColor w-full h-full pt-8 text-md text-PrimaryTextColorLight/70 dark:text-PrimaryTextColor/70 px-6">
      <div className="flex flex-row justify-between items-center w-full mb-4">
        <p className="font-semibold text-lg text-PrimaryTextColorLight dark:text-PrimaryTextColor">
          {selectVt ? t("edit.virtual") : t("add.virtual")}
        </p>
        <CloseIcon
          className="cursor-pointer stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor"
          onClick={onClose}
        />
      </div>
      <BackingSelector openSlider={drawerOpen} newVt={newVt} setNewVt={setNewVt} edit={selectVt ? true : false} />
      <div className="flex flex-col items-start w-full mt-3 mb-3">
        <p className="opacity-60">{t("description")}</p>
        <CustomInput
          sizeInput={"small"}
          intent={"secondary"}
          placeholder=""
          compOutClass=""
          value={newVt.name}
          onChange={onNameChange}
        />
      </div>
      <div className="flex flex-col items-start justify-start w-[50%] mt-3 mb-3">
        <p className="opacity-60">{t("balance")}</p>
        <CustomInput
          sizeInput={"small"}
          intent={"secondary"}
          placeholder="0"
          compOutClass=""
          value={newVt.amount}
          onChange={onBalanceChange}
          sufix={<AssetSymbol ft={getFtFromVt(newVt.backing)} textClass="break-keep whitespace-nowrap" />}
        />
      </div>
      <div className="flex flex-col items-start justify-start mt-3 mb-3 w-full">
        <p className="opacity-60">{t("expiration")}</p>
        <div className="flex flex-row justify-start items-center w-full gap-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="relative">
              <DateTimePicker
                disabled={newVt.expiration === 0}
                value={newVt.expiration === 0 ? null : dayjs(newVt.expiration)}
                onChange={onDateChange}
                className={`!cursor-pointer !w-full ${theme === "light" ? "date-picker-light" : "date-picker"}`}
                timezone="system"
                format="MM/DD/YY hh:mm:ss a"
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                timeSteps={{ minutes: 1, seconds: 5 }}
                disablePast
                views={["day", "hours", "minutes", "seconds"]}
              />
              {expiration && (
                <div className="absolute w-[12.5rem] h-[2rem] top-0 left-0" onClick={onTimePickerClic}></div>
              )}
            </div>
          </LocalizationProvider>
          <div className="p-0 flex flex-row gap-2 cursor-pointer" onClick={onChangeExpirationCheck}>
            <CustomCheck className="border-BorderColorLight dark:border-BorderColor" checked={expiration} />
            <p className="text-md">{t("no.expiration")}</p>
          </div>
        </div>
      </div>
      {!selectVt ? (
        <div className="flex flex-col items-start justify-start w-full mt-3 mb-3">
          <AccesBySelector
            openSlider={drawerOpen}
            newVt={newVt}
            setNewVt={setNewVt}
            onAccesChange={onAccesChange}
            accesErr={accesErr}
            setAccesErr={setAccesErr}
          />
        </div>
      ) : (
        <div className="flex flex-row justify-between items-center w-full p-2 bg-ThemeColorBackLight dark:bg-ThemeColorBack rounded-md">
          <p className="opacity-60">{t("access.by")}</p>
          <div className="flex flex-row justify-start items-center gap-2">
            <p className="">{shortAddress(selectVt.accesBy, 6, 4)}</p>
            <CustomCopy size={"xSmall"} className="p-0" copyText={selectVt.accesBy} />
          </div>
        </div>
      )}
      <div className="w-full flex flex-row justify-between items-center mt-12 gap-4">
        <p className="text-sm text-TextErrorColor text-left">{errMsg}</p>
        <CustomButton className="min-w-[5rem]" onClick={onSave} size={"small"}>
          {loading ? <LoadingLoader className="mt-1" /> : <p>{t(selectVt ? "save" : "add")}</p>}
        </CustomButton>
      </div>
    </div>
  );

  function onClose() {
    setDrawerOpen(false);
    setSelVt(undefined);
  }

  async function onSave() {
    setLoading(true);
    const { err, errMsg } = verifyVirtualData(newVt);
    const amnt = getHoleAmount(newVt.amount, getFtFromVt(newVt.backing).decimal, true) as bigint;
    if (!err) {
      setErrMsg("");
      if (selectVt) {
        let changeOnlyName = false;
        if (
          BigInt(selectVt.amount) === amnt &&
          selectVt.backing === newVt.backing &&
          selectVt.expiration === newVt.expiration &&
          selectVt.name !== newVt.name
        )
          changeOnlyName = true;
        if (!changeOnlyName)
          try {
            await ingressActor.updateVirtualAccounts([
              [
                BigInt(newVt.virt_sub_acc_id),
                {
                  backingAccount: [BigInt(newVt.backing)],
                  state: [{ ft_set: amnt }],
                  expiration: [BigInt(newVt.expiration * 1000000)],
                },
              ],
            ]);
          } catch (e) {
            console.log("updateVT-err:", e);
            setErrMsg(t("err.back"));
          }
        saveInLocalstorage(
          {
            id: newVt.virt_sub_acc_id,
            name: newVt.name,
            ftId: getFtFromVt(newVt.backing).id,
            accesBy: selectVt.accesBy,
            isMint: newVt.isMint,
          },
          selectVt,
          true,
          false,
        );
      } else {
        try {
          const isFirstVt = hplVTsData.length === 0;
          const res = (await ingressActor.openVirtualAccounts([
            [
              { ft: BigInt(getFtFromVt(newVt.backing).id) },
              Principal.fromText(newVt.accesBy),
              { ft: amnt },
              BigInt(newVt.backing),
              BigInt(newVt.expiration * 1000000),
            ],
          ])) as any;

          const mintActor = Actor.createActor<HplMintActor>(HplMintIDLFactory, {
            agent: userAgent,
            canisterId: newVt.accesBy,
          });
          let isMint = false;
          try {
            isMint = await mintActor.isHplMinter();
          } catch (error) {
            isMint = false;
          }

          saveInLocalstorage(
            {
              id: res.ok.first.toString(),
              name: newVt.name,
              ftId: getFtFromVt(newVt.backing).id,
              accesBy: newVt.accesBy,
              isMint: isMint,
            },
            selectVt!,
            false,
            isFirstVt,
          );
        } catch (e) {
          console.log("addVT-err:", e);
          setErrMsg(t("err.back"));
        }
      }
    } else {
      setErrMsg(errMsg);
    }
    setLoading(false);
  }

  function verifyVirtualData(vt: HPLVirtualSubAcc) {
    let res: { err: boolean; errMsg: string } = { err: false, errMsg: "" };
    if (vt.backing === "") res = { err: true, errMsg: res.errMsg + " " + t("err.backing") };
    if (vt.expiration != 0 && dayjs(vt.expiration).isBefore(dayjs()))
      res = { err: true, errMsg: res.errMsg + " " + t("err.expiration") };
    try {
      Principal.fromText(vt.accesBy);
    } catch {
      res = { err: true, errMsg: res.errMsg + " " + t("err.principal") };
    }
    return res;
  }

  async function saveInLocalstorage(vt: HPLVirtualData, selVt: HPLVirtualSubAcc, edit: boolean, isFirstVt: boolean) {
    let auxVts: HPLVirtualData[] = [];

    let myOwnerId = ownerId;
    if (isFirstVt) {
      const ownerID = await ownersActor.lookup(Principal.fromText(authClient));
      if (ownerID[0]) {
        myOwnerId = ownerID[0].toString();
        editOwnerId(myOwnerId);
      }
    }

    if (edit) {
      let exist = false;
      hplVTsData.map((vtdData) => {
        if (vtdData.id === selVt.virt_sub_acc_id) {
          auxVts.push({ ...vtdData, name: newVt.name });
          exist = true;
        } else return auxVts.push(vtdData);
      });
      !exist && auxVts.push({ ...vt, name: newVt.name });
    } else {
      auxVts = [...hplVTsData, vt];
    }

    // localStorage.setItem(
    //   "hplVT-" + authClient,
    //   JSON.stringify({
    //     vt: auxVts,
    //   }),
    // );
    await db().updateHplVirtualsByLedger(auxVts);
    const amnt = getHoleAmount(newVt.amount, getFtFromVt(newVt.backing).decimal, true) as bigint;
    if (edit) {
      editVtData(auxVts);
      changeVtName(selectSub?.sub_account_id || "", { ...newVt, amount: amnt.toString() });
      editLink({ ...newVt, amount: amnt.toString() });
    } else {
      addVt(vt, { ...newVt, amount: amnt.toString(), code: getPxlCode(myOwnerId, vt.id) });
      addLink({ ...newVt, amount: amnt.toString(), code: getPxlCode(myOwnerId, vt.id) });
    }

    onClose();
  }
};
export default DrawerVirtual;
