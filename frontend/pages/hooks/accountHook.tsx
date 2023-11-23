import { useAppDispatch, useAppSelector } from "@/redux/Store";
import { setAuthenticated } from "@redux/auth/AuthReducer";

export const AccountHook = () => {
  const dispatch = useAppDispatch();
  const { authClient, userAgent, hplDictionary, hplLedger } = useAppSelector((state) => state.auth);
  const setAuthClient = (authClient: string) => {
    dispatch(setAuthenticated(true, false, authClient.toLowerCase()));
  };
  return { authClient, setAuthClient, userAgent, hplLedger, hplDictionary };
};
