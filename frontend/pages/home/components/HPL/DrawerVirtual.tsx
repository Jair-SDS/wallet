// svgs
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/Input";
import { useHPL } from "@pages/hooks/hplHook";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HPLVirtualData, HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { ThemeHook } from "@pages/hooks/themeHook";
import { CustomCheck } from "@components/CheckBox";
import { CustomButton } from "@components/Button";
import { CustomCopy } from "@components/CopyTooltip";
import { shortAddress } from "@/utils";
import dayjs from "dayjs";
import { Principal } from "@dfinity/principal";
import { AccountHook } from "@pages/hooks/accountHook";
import LoadingLoader from "@components/Loader";
import BackingSelector from "./BackingSelector";

interface DrawerVirtualProps {
  setDrawerOpen(value: boolean): void;
  drawerOpen: boolean;
}

const DrawerVirtual = ({ setDrawerOpen, drawerOpen }: DrawerVirtualProps) => {
  const { t } = useTranslation();
  const { theme } = ThemeHook();
  const { authClient } = AccountHook();
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
    reloadHPLBallance,
    expiration,
    setExpiration,
    onNameChange,
    onAccesChange,
    onBalanceChange,
    onChangeExpirationCheck,
    onDateChange,
  } = useHPL(false);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (drawerOpen) {
      setLoading(false);
      setErrMsg("");
      setExpiration(true);
      if (selectVt) {
        setNewVt(selectVt);
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
      <BackingSelector newVt={newVt} setNewVt={setNewVt} edit={selectVt ? true : false} />
      <div className="flex flex-col items-start w-full mt-3 mb-3">
        <p className="opacity-60">{t("name")}</p>
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
          sufix={<p className="pr-2">{getFtFromVt(newVt.backing).symbol}</p>}
        />
      </div>
      <div className="flex flex-col items-start justify-start mt-3 mb-3 w-full">
        <p className="opacity-60">{t("expiration")}</p>
        <div className="flex flex-row justify-start items-center w-full gap-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              disabled={newVt.expiration === 0}
              value={newVt.expiration === 0 ? null : dayjs(newVt.expiration)}
              onChange={onDateChange}
              className={`${theme === "light" ? "date-picker-light" : "date-picker"}`}
              timezone="system"
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: null,
              }}
              disablePast
            />
          </LocalizationProvider>
          <button className="p-0 flex flex-row gap-2" onClick={onChangeExpirationCheck}>
            <CustomCheck className="border-BorderColorLight dark:border-BorderColor" checked={expiration} />
            <p className="text-md">{t("no.expiration")}</p>
          </button>
        </div>
      </div>
      {!selectVt ? (
        <div className="flex flex-col items-start justify-start w-full mt-3 mb-3">
          <p className="opacity-60">{t("acces.principal")}</p>
          <CustomInput
            sizeInput={"small"}
            intent={"secondary"}
            compOutClass=""
            value={newVt.accesBy}
            onChange={onAccesChange}
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
    if (!err) {
      setErrMsg("");
      if (selectVt) {
        try {
          await ingressActor.updateVirtualAccount(BigInt(newVt.virt_sub_acc_id), {
            backingAccount: [BigInt(newVt.backing)],
            state: [{ ft_set: BigInt(newVt.amount) }],
            expiration: [BigInt(newVt.expiration)],
          });
          saveInLocalstorage({ id: newVt.virt_sub_acc_id, name: newVt.name }, selectVt, true);
        } catch (e) {
          setErrMsg(t("err.back"));
        }
      } else {
        try {
          const res = (await ingressActor.openVirtualAccount(
            { ft: BigInt(getFtFromVt(newVt.backing).id) },
            Principal.fromText(newVt.accesBy),
            { ft: BigInt(newVt.amount) },
            BigInt(newVt.backing),
            BigInt(newVt.expiration),
          )) as any;
          saveInLocalstorage({ id: res.ok.id.toString(), name: newVt.name }, selectVt!, false);
        } catch {
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

  function saveInLocalstorage(vt: HPLVirtualData, selVt: HPLVirtualSubAcc, edit: boolean) {
    let auxVts: HPLVirtualData[] = [];
    if (edit) {
      let exist = false;
      hplVTsData.map((vtdData) => {
        if (vtdData.id === selVt.virt_sub_acc_id) {
          auxVts.push({ id: vtdData.id, name: newVt.name });
          exist = true;
        } else return auxVts.push(vtdData);
      });
      !exist && auxVts.push({ id: vt.id, name: newVt.name });
    } else {
      auxVts = [...hplVTsData, vt];
    }
    localStorage.setItem(
      "hplVT-" + authClient,
      JSON.stringify({
        vt: auxVts,
      }),
    );
    editVtData(auxVts);
    reloadHPLBallance();
    onClose();
  }
};
export default DrawerVirtual;
