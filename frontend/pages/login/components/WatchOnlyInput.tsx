import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
//
import { CustomInput } from "@components/input";
import { handlePrincipalAuthenticated } from "@redux/CheckAuth";
import { clsx } from "clsx";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon, CounterClockwiseClockIcon } from "@radix-ui/react-icons";
import { setWatchOnlyHistory } from "@redux/common/CommonReducer";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { getWatchOnlySessionsFromLocal } from "@pages/helpers/watchOnlyStorage";
import { validatePrincipal } from "@/utils/identity";

interface WatchOnlyInputProps {
  principalAddress: string;
  setPrincipalAddress: Dispatch<SetStateAction<string>>;
}

export default function WatchOnlyInput(props: WatchOnlyInputProps) {
  const { principalAddress, setPrincipalAddress } = props;
  const { watchOnlyHistory } = useAppSelector((state) => state.common);
  const [historicalOpen, setHistoricalOpen] = useState(false);
  const dispatch = useAppDispatch();



  useEffect(() => {
    const watchOnlyItems = getWatchOnlySessionsFromLocal();
    if (watchOnlyItems.length !== watchOnlyHistory.length) {
      dispatch(setWatchOnlyHistory(watchOnlyItems));
    }
  }, []);

  return (
    <div className="relative w-full">
      <CustomInput
        sizeInput={"medium"}
        intent={"secondary"}
        compOutClass=""
        value={principalAddress}
        onChange={onPrincipalChange}
        onFocus={onFocushandler}
        autoFocus
        border={validatePrincipal(principalAddress) ? undefined : "error"}
        sufix={
          <WatchOnlyInputSuffix
            principalAddress={principalAddress}
            watchOnlyLoginErr={!validatePrincipal(principalAddress)}
            historicalOpen={historicalOpen} onChevronClick={() => setHistoricalOpen((prev) => !prev)}
          />
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") handlePrincipalAuthenticated(principalAddress);
        }}
      />
      {historicalOpen && watchOnlyHistory.length > 0 && (
        <div className={itemsRootStyles}>
          {watchOnlyHistory.map((data) => (
            <HistoricalItem key={data.principal} onHistoricalSelectHandler={onHistoricalSelectHandler} data={data} />
          ))}
        </div>
      )}
    </div>
  );

  function onPrincipalChange(e: ChangeEvent<HTMLInputElement> | string) {
    const value = typeof e === "string" ? e : e.target.value;
    setPrincipalAddress(value);
  }

  function onFocushandler() {
    if (!historicalOpen) setHistoricalOpen(true);
  }

  function onHistoricalSelectHandler(principal: string) {
    setHistoricalOpen(false);
    setPrincipalAddress(principal);
    onPrincipalChange(principal);
  }
}

interface HistoricalItemProps {
  onHistoricalSelectHandler: (principal: string) => void;
  data: WatchOnlyItem;
  isLast?: boolean;
}

function HistoricalItem(props: HistoricalItemProps) {
  const { onHistoricalSelectHandler, data } = props;

  return (
    <div className={itemStyles} onClick={() => onHistoricalSelectHandler(data.principal)}>
      <div className="flex items-center justify-between">
        <CounterClockwiseClockIcon className="w-4 h-4 mr-2" />
        <div className="text-left">
          <div className="text-sm">{!data?.alias || data?.alias?.length > 0 ? data.alias : "-"}</div>
          <div className="text-sm">{data.principal}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------ COMPONENT ------------------------------

interface WatchOnlyInputSuffixProps {
  principalAddress: string;
  watchOnlyLoginErr: boolean;
  historicalOpen: boolean;
  onChevronClick: () => void;
};

function WatchOnlyInputSuffix(props: WatchOnlyInputSuffixProps) {
  const { principalAddress, watchOnlyLoginErr, historicalOpen, onChevronClick } = props;

  return (
    <div className="flex">
      {principalAddress.length > 0
        ? (<CheckIcon className={getCheckIconStyles(principalAddress, watchOnlyLoginErr)} onClick={() => handlePrincipalAuthenticated(principalAddress)} />)
        : null
      }

      {historicalOpen ? <ChevronDownIcon className="w-4 h-4 opacity-50 cursor-pointer" onClick={onChevronClick} /> : null}
      {!historicalOpen ? <ChevronLeftIcon className="w-4 h-4 opacity-50 cursor-pointer" onClick={onChevronClick} /> : null}
    </div>
  );
}

// ------------------------------ STYLES ------------------------------

export interface WatchOnlyItem {
  principal: string;
  alias?: string;
}

function getCheckIconStyles(principalAddress: string, watchOnlyLoginErr: boolean) {
  return clsx({
    "w-4 h-4 opacity-50 mr-2 cursor-pointer": true,
    "stroke-BorderSuccessColor": principalAddress.length > 0 && !watchOnlyLoginErr,
    "stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor": !principalAddress.length || watchOnlyLoginErr,
  })
}

const itemsRootStyles = clsx(
  "absolute z-10 w-full mt-1",
  "bg-white dark:bg-level-1-color",
  "rounded-sm shadow-lg",
  "overflow-y-auto  scroll-y-light",
  "max-h-[10rem]",
);

const itemStyles = clsx(
  "cursor-pointer",
  "flex items-center justify-between px-2 py-1",
  "dark:bg-level-1-color bg-secondary-color-1-light",
  "dark:hover:bg-secondary-color-2 hover:bg-secondary-color-2-light",
  "text-black-color dark:text-white",
  "transition-all duration-100 ease-in-out",
);
