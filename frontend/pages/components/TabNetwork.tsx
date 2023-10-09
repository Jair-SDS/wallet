import { ProtocolType, ProtocolTypeEnum } from "@/const";
import { AssetHook } from "@pages/home/hooks/assetHook";

interface TabNetworkProps {
  children: any;
}

const TabNetwork = ({ children }: TabNetworkProps) => {
  const { protocol, setProtocolType } = AssetHook();
  const networks = Object.keys(ProtocolTypeEnum.Values);
  return (
    <div className="w-full h-full flex flex-col justify-start items-start px-3">
      <div className="flex flex-row justify-start items-center w-full gap-5">
        {networks.map((ntw, k) => {
          return getTabItem(ntw as ProtocolType, k);
        })}
      </div>
      <div className="flex justify-start items-start w-full h-full border rounded-tr border-SelectRowColor">
        {children}
      </div>
    </div>
  );

  function getTabItem(ntw: ProtocolType, k: number) {
    return (
      <div
        key={k}
        className={`relative flex justify-center items-center w-20 border border-r-0 text-md rounded-t-md network-tab before:border-t  ${
          ntw === protocol
            ? "border-SelectRowColor border-b-PrimaryColorLight dark:border-b-PrimaryColor before:border-t-SelectRowColor before:bg-PrimaryColorLight dark:before:bg-PrimaryColor"
            : "border-BorderColor border-b-0 before:border-t-BorderColor"
        }`}
      >
        <div
          className={`relative flex justify-center items-center w-full button-network-tab ${
            ntw === protocol ? "before:bg-PrimaryColorLight dark:before:bg-PrimaryColor" : ""
          }`}
        >
          <button
            className="py-1 w-20"
            onClick={() => {
              onSelectTab(ntw);
            }}
          >
            <p className={`${ntw === protocol ? "text-SelectRowColor" : ""}`}>{ntw}</p>
          </button>
        </div>
      </div>
    );
  }

  function onSelectTab(ntw: ProtocolType) {
    setProtocolType(ntw);
  }
};

export default TabNetwork;
