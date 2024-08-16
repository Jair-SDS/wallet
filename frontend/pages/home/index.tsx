import "./style.scss";
import AssetsList from "./components/ICRC/asset";
import DetailList from "./components/ICRC/transaction";
import { useAppSelector } from "@redux/Store";
import { ProtocolTypeEnum } from "@common/const";
import SubaccountList from "./components/HPL/SubAccountList";
import SubaccountDetail from "./components/HPL/HplSubaccountDetail";
import { Fragment } from "react/jsx-runtime";

const Home = () => {
  const { protocol } = useAppSelector((state) => state.common);
  return (
    <Fragment>
      <div className="flex flex-row w-full h-full">
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? <AssetsList /> : <SubaccountList />}
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? <DetailList /> : <SubaccountDetail />}
      </div>
    </Fragment>
  );
};

export default Home;
