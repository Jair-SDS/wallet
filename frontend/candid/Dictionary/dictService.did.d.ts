import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export interface CreateArgument {
  assetId: bigint;
  logo: string;
  name: string;
  symbol: string;
}
export interface FungibleToken {
  assetId: bigint;
  modifiedAt: bigint;
  logo: string;
  name: string;
  createdAt: bigint;
  symbol: string;
}
export interface UpdateArgument {
  logo: [] | [string];
  name: [] | [string];
  symbol: [] | [string];
}
export interface _SERVICE {
  addOwner: ActorMethod<[Principal], undefined>;
  addToken: ActorMethod<[CreateArgument], undefined>;
  allTokens: ActorMethod<[], Array<FungibleToken>>;
  correctAssetId: ActorMethod<[string, bigint], undefined>;
  correctSymbol: ActorMethod<[bigint, string], undefined>;
  freezingPeriod: ActorMethod<[], bigint>;
  nTokens: ActorMethod<[], bigint>;
  owners: ActorMethod<[], Array<Principal>>;
  removeOwner: ActorMethod<[Principal], undefined>;
  tokenByAssetId: ActorMethod<[bigint], [] | [FungibleToken]>;
  tokenBySymbol: ActorMethod<[string], [] | [FungibleToken]>;
  updateToken: ActorMethod<[bigint, UpdateArgument], undefined>;
}
