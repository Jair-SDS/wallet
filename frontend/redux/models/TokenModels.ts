import { z } from "zod";
import { AuthNetworkNameEnum, AuthNetworkTypeEnum } from "@/common/const";
import { SimpleTransferStatusKey, TransferAccountReference } from "@research-ag/hpl-client";

const TokenMarketInfo = z.object({
  id: z.number(),
  name: z.string(),
  symbol: z.string(),
  price: z.number(),
});

export type TokenMarketInfo = z.infer<typeof TokenMarketInfo>;

const FungibleTokenLocal = z.object({
  creation_time: z.number(),
  assetId: z.string(),
  logo: z.string(),
  name: z.string(),
  modification_time: z.number(),
  symbol: z.string(),
});
export type FungibleTokenLocal = z.infer<typeof FungibleTokenLocal>;

const AuthNetwork = z.object({
  name: AuthNetworkNameEnum,
  extra: z.string().optional(),
  icon: z.any(),
  type: AuthNetworkTypeEnum,
  network: z.any(),
});

export type AuthNetwork = z.infer<typeof AuthNetwork>;

//
export type TxArgs = [
  from: TransferAccountReference,
  to: TransferAccountReference,
  asset: bigint,
  amount: number | bigint | "max",
  memo?: Array<Uint8Array | number[]>,
];

export type TxHistoryEntry = {
  txArgs: TxArgs;
  lastSeenStatus: SimpleTransferStatusKey | "pickAggregator" | "submitting" | null;
  aggregatorPrincipal: string | null;
  txId?: [bigint, bigint];
  submitRequestId?: string;
  errorMessage?: string;
};

const SnsToken = z.object({
  index: z.string(),
  canister_ids: z.object({
    root_canister_id: z.string(),
    governance_canister_id: z.string(),
    index_canister_id: z.string(),
    swap_canister_id: z.string(),
    ledger_canister_id: z.string(),
  }),
  list_sns_canisters: z.any(),
  meta: z.object({
    url: z.string(),
    name: z.string(),
    description: z.string(),
    logo: z.string(),
  }),
  parameters: z.any(),
  nervous_system_parameters: z.any(),
  swap_state: z.any(),
  icrc1_metadata: z.array(z.any()),
  icrc1_fee: z.array(z.string()),
  icrc1_total_supply: z.string(),
  swap_params: z.any(),
  init: z.any(),
  derived_state: z.any(),
  lifecycle: z.any(),
});
export type SnsToken = z.infer<typeof SnsToken>;
