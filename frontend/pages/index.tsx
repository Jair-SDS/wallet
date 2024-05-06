import { lazy } from "react";
import Login from "./login";
import LayoutComponent from "./components/LayoutComponent";
import history from "./history";
import { useAppSelector } from "@redux/Store";
import Loader from "./components/Loader";
import { RoutingPathEnum } from "@/const";
import { Redirect, Router, Switch } from "react-router-dom";
import PrivateRoute from "./components/privateRoute";
import WorkersWrapper from "@/wrappers/WorkersWrapper";

const Home = lazy(() => import("./home"));
const Contacts = lazy(() => import("./contacts"));
const Assets = lazy(() => import("./assets"));
const ExchangeLinks = lazy(() => import("./links"));

const SwitchRoute = () => {
  const { authLoading, superAdmin, authenticated, route, blur } = useAppSelector((state) => state.auth);

  if (authLoading) return <Loader />;
  return (
    <>
      {blur && <div className="fixed w-full h-full bg-black/50 z-[900]"></div>}
      <Router history={history}>
        {!superAdmin && authenticated && (
          <WorkersWrapper>
            <LayoutComponent isLoginPage={false}>
              <Switch>
                <PrivateRoute
                  exact
                  path="/"
                  authenticated={authenticated}
                  allowByRole={true}
                  Component={getComponentAuth()}
                />
                <Redirect to="/" />
              </Switch>
            </LayoutComponent>
          </WorkersWrapper>
        )}
        {!superAdmin && !authenticated && (
          <Switch>
            <PrivateRoute exact path="/" authenticated={authenticated} allowByRole={true} Component={Login} />
            <Redirect to="/" />
          </Switch>
        )}
      </Router>
    </>
  );

  function getComponentAuth() {
    switch (route) {
      case RoutingPathEnum.Enum.CONTACTS:
        return Contacts;
      case RoutingPathEnum.Enum.HOME:
        return Home;
      case RoutingPathEnum.Enum.ASSETS:
        return Assets;
      case RoutingPathEnum.Enum.LINKS:
        return ExchangeLinks;
      default:
        return Home;
    }
  }
};

export default SwitchRoute;
