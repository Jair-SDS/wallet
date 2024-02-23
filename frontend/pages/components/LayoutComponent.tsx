import { Suspense } from "react";
import { RouteProps } from "react-router-dom";
import "./style.scss";
import TabNetwork from "./TabNetwork";
import TopBarComponent from "./topbar";
interface LayoutProps extends RouteProps {
  children: any;
  isLoginPage: boolean;
}

const LayoutComponent = ({ children, isLoginPage }: LayoutProps) => {
  return (
    <div className="w-full bg-PrimaryColorLight dark:bg-PrimaryColor">
      <div className={"flex flex-col w-full h-screen"}>
        <TopBarComponent isLoginPage={isLoginPage}></TopBarComponent>
        <Suspense>
          <TabNetwork>{children}</TabNetwork>
        </Suspense>
      </div>
    </div>
  );
};

export default LayoutComponent;
