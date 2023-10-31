import { Route, Redirect, RouteProps } from "react-router-dom";

interface MyRouteProps extends RouteProps {
  Component: any;
  authenticated: boolean;
  allowByRole: boolean;
  rest?: any;
}

const PrivateRoute = ({ Component, allowByRole, ...rest }: MyRouteProps) => {
  return (
    <Route
      {...rest}
      render={(props: any) => {
        if (allowByRole) {
          return <Component {...props} history={props.history}></Component>;
        } else {
          return <Redirect to={"/"} />;
        }
      }}
    />
  );
};

export default PrivateRoute;
