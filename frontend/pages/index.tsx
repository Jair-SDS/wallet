import { lazy, useEffect } from "react";
import Login from "./login";
import LayoutComponent from "./components/LayoutComponent";
import history from "./history";
import { useAppSelector } from "@redux/Store";
import { ThemeHook } from "./hooks/themeHook";
import Loader from "./components/Loader";
import { RoutingPathEnum, ThemesEnum } from "@/const";
const Home = lazy(() => import("./home"));
const Contacts = lazy(() => import("./contacts"));

const SwitchRoute = () => {
  const { authLoading, superAdmin, authenticated, route, blur } = useAppSelector((state) => state.auth);
  const { changeTheme } = ThemeHook();

  useEffect(() => {
    if (
      localStorage.theme === ThemesEnum.enum.dark ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add(ThemesEnum.enum.dark);
      localStorage.theme = ThemesEnum.enum.dark;
      changeTheme(ThemesEnum.enum.dark);
    } else {
      document.documentElement.classList.remove(ThemesEnum.enum.dark);
      localStorage.theme = ThemesEnum.enum.light;
      changeTheme(ThemesEnum.enum.light);
    }
  }, []);

  return authLoading ? (
    <Loader></Loader>
  ) : (
    <>
      {blur && <div className="fixed w-full h-full bg-black/50 z-[900]"></div>}
      {!superAdmin && authenticated && (
        <LayoutComponent role={1} history={history}>
          {getComponentAuth()}
        </LayoutComponent>
      )}
      {!superAdmin && !authenticated && getComponentNoAuth()}
    </>
  );

  function getComponentAuth() {
    switch (route) {
      case RoutingPathEnum.Enum.CONTACTS:
        return <Contacts></Contacts>;
      case RoutingPathEnum.Enum.HOME:
        return <Home></Home>;
      default:
        return <Home></Home>;
    }
  }
  function getComponentNoAuth() {
    switch (route) {
      case RoutingPathEnum.Enum.LOGIN:
        return <Login></Login>;

      default:
        return <Login></Login>;
    }
  }
};

export default SwitchRoute;
