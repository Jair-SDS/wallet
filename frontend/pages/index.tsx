import { lazy, useEffect } from "react";
import Login from "./login";
import LayoutComponent from "./components/LayoutComponent";
import history from "./history";
import { useAppSelector } from "@redux/Store";
import { ThemeHook } from "./hooks/themeHook";
import Loader from "./components/Loader";
import { RoutingPathEnum, ThemesEnum } from "@/const";
import { Redirect, Router, Switch } from "react-router-dom";
import PrivateRoute from "./components/privateRoute";
import { db } from "@/database/db";

const Home = lazy(() => import("./home"));
const Contacts = lazy(() => import("./contacts"));
const Assets = lazy(() => import("./assets"));

const SwitchRoute = () => {
  const { authLoading, superAdmin, authenticated, route, blur } = useAppSelector((state) => state.auth);
  const { changeTheme } = ThemeHook();

  useEffect(() => {
    const theme = db().getTheme();
    if (
      theme === ThemesEnum.enum.dark ||
      (theme === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add(ThemesEnum.enum.dark);
      db().setTheme(ThemesEnum.enum.dark);
      changeTheme(ThemesEnum.enum.dark);
    } else {
      document.documentElement.classList.remove(ThemesEnum.enum.dark);
      db().setTheme(ThemesEnum.enum.light);
      changeTheme(ThemesEnum.enum.light);
    }
  }, []);

  return authLoading ? (
    <Loader></Loader>
  ) : (
    <>
      {blur && <div className="fixed w-full h-full bg-black/50 z-[900]"></div>}
      <Router history={history}>
        {!superAdmin && authenticated && (
          <LayoutComponent>
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
      default:
        return Home;
    }
  }
};

export default SwitchRoute;
