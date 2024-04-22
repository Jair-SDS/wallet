import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { Asset } from "@redux/models/AccountModels";
import { TokenMarketInfo } from "@redux/models/TokenModels";

export interface UpdateAllBalancesParams {
  /**
   * HttpAgent object used for making network requests
   */
  myAgent?: HttpAgent;
  assets: Asset[];
  basicSearch?: boolean;
  fromLogin?: boolean;
}

export type RefreshOptions = {
  myAgent: HttpAgent;
  basicSearch?: boolean;
  tokenMarkets: TokenMarketInfo[];
  myPrincipal: Principal;
};

export type UpdateAllBalances = (params: UpdateAllBalancesParams) => Promise<Asset[] | undefined>;

export interface GetAllTransactionsICPParams {
  subaccount_index: string;
  loading: boolean;
  isOGY: boolean;
}
