// svgs
import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
//
import "./style.scss";
import AssetsList from "./components/ICRC/asset";
import DetailList from "./components/ICRC/transaction";
import { BasicModal } from "@components/modal";
import { useAppDispatch, useAppSelector } from "@redux/Store";
import { CustomButton } from "@components/button";
import { useTranslation } from "react-i18next";
import { setDisclaimer } from "@redux/auth/AuthReducer";
import { ProtocolTypeEnum } from "@common/const";
import SubaccountList from "./components/HPL/SubAccountList";
import SubaccountDetail from "./components/HPL/HplSubaccountDetail";
import { Fragment } from "react/jsx-runtime";

const Home = () => {
  const { t } = useTranslation();
  const { disclaimer } = useAppSelector((state) => state.auth);
  const { protocol } = useAppSelector((state) => state.common);
  const dispatch = useAppDispatch();
  return (
    <Fragment>
      <div className="flex flex-row w-full h-full">
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? <AssetsList /> : <SubaccountList />}
        {protocol === ProtocolTypeEnum.Enum.ICRC1 ? <DetailList /> : <SubaccountDetail />}
      </div>
      <BasicModal open={disclaimer} width="w-[30rem]" border="dark:border-2 dark:border-gray-color-6">
        <div className="flex flex-col items-start justify-start w-full gap-4">
          <div className="flex items-center justify-start gap-4 fle-row">
            <WarningIcon className="w-6 h-6" />
            <p className="font-semibold">{t("disclaimer.title")}</p>
          </div>
          <p className="text-justify ">{t("disclaimer.msg")}</p>
          <div className="flex flex-row items-start justify-end w-full ">
            <CustomButton
              className="min-w-[5rem]"
              onClick={() => {
                dispatch(setDisclaimer(false));
              }}
              size={"small"}
            >
              <p className="text-center">{t("agree")}</p>
            </CustomButton>
          </div>
        </div>
      </BasicModal>
    </Fragment>
  );
};

export default Home;
