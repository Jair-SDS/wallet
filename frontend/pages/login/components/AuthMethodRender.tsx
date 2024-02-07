// svgs
//
import { handleAuthenticated } from "@/redux/CheckAuth";
import { AuthNetworkTypeEnum } from "@/const";
import { AuthNetwork } from "@redux/models/TokenModels";
import { LoginHook } from "../hooks/loginhook";
import { useTranslation } from "react-i18next";
import SeedInput from "./SeedInput";
import WatchOnlyInput from "./WatchOnlyInput";

export default function AuthMethodRender() {
  const { t } = useTranslation();
  const {
    loginOpts,
    seedOpen,
    setSeedOpen,
    seed,
    setSeed,
    watchOnlyOpen,
    setWatchOnlyOpen,
    principalAddress,
    setPrincipalAddress,
  } = LoginHook();

  return (
    <div className="flex flex-col justify-start items-start w-[70%] mt-8">
      <p className="font-light text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor">
        {t("login.choose.msg")}
      </p>
      {loginOpts.map((opt, k) => (
        <OptionItem key={`${opt.name}-${k}`} opt={opt} />
      ))}
    </div>
  );

  function OptionItem({ opt }: { opt: AuthNetwork }) {
    return (
      <div className="flex flex-col items-start justify-start w-full">
        <div
          className="flex flex-row justify-between items-center w-full mt-4 p-3 rounded-[5%] cursor-pointer bg-SecondaryColorLight dark:bg-SecondaryColor"
          onClick={async () => {
            handleLogin(opt);
          }}
        >
          <h3 className="font-medium text-PrimaryTextColorLight dark:text-PrimaryTextColor">
            {opt.name} <span className="text-md opacity-60">{opt.extra ? `(${t(opt.extra)})` : ""}</span>
          </h3>
          {opt.icon}
        </div>

        {seedOpen && opt.type === AuthNetworkTypeEnum.Enum.S && <SeedInput seed={seed} setSeed={setSeed} />}
        {watchOnlyOpen && opt.type === AuthNetworkTypeEnum.Enum.WO && (
          <WatchOnlyInput principalAddress={principalAddress} setPrincipalAddress={setPrincipalAddress} />
        )}
      </div>
    );
  }

  async function handleLogin(opt: AuthNetwork) {
    if (opt.type === AuthNetworkTypeEnum.Values.IC || opt.type === AuthNetworkTypeEnum.Values.NFID) {
      setSeedOpen(false);
      setWatchOnlyOpen(false);
      localStorage.setItem("network_type", JSON.stringify({ type: opt.type, network: opt.network, name: opt.name }));
      handleAuthenticated(opt);
    } else if (opt.type === AuthNetworkTypeEnum.Enum.S) {
      setSeedOpen((prev) => !prev);
      setSeed("");
    } else if (opt.type === AuthNetworkTypeEnum.Enum.WO) {
      setWatchOnlyOpen((prev) => !prev);
      setPrincipalAddress("");
    }
  }
}
