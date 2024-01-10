import { Suspense } from "react";
import { RouteProps } from "react-router-dom";
import "./style.scss";
import TopBarComponent from "./topbar";
import TabNetwork from "./TabNetwork";
interface LayoutProps extends RouteProps {
  children: any;
}
const LayoutComponent = ({ children }: LayoutProps) => {
  return (
    <div className="w-full bg-PrimaryColorLight dark:bg-PrimaryColor">
      <div className={"flex flex-col w-full h-screen"}>
        <TopBarComponent></TopBarComponent>
        <Suspense>
          <TabNetwork>{children}</TabNetwork>
        </Suspense>
      </div>
    </div>
  );
};

export default LayoutComponent;
