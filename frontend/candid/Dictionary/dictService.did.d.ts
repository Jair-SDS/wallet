/* eslint-disable @typescript-eslint/ban-types */
import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type AssetId = bigint;
export interface Directory {
  addOwner: ActorMethod<[Principal], boolean>;
  correctAssetId: ActorMethod<[Symbol, AssetId], boolean>;
  correctSymbol: ActorMethod<[AssetId, Symbol], boolean>;
  getByAssetId: ActorMethod<[AssetId], [] | [FungibleToken]>;
  getBySymbol: ActorMethod<[Symbol], [] | [FungibleToken]>;
  getDump: ActorMethod<[], Array<FungibleToken>>;
  register: ActorMethod<[FungibleToken], boolean>;
  removeOwner: ActorMethod<[Principal], boolean>;
  updateTokenByAssetId: ActorMethod<[AssetId, string, string], boolean>;
  updateTokenBySymbol: ActorMethod<[Symbol, string, string], boolean>;
}
export interface FungibleToken {
  creation_time: Time;
  assetId: AssetId;
  logo: Logo;
  name: Name;
  modification_time: Time;
  displaySymbol: Symbol;
  symbolKey: Symbol;
}
export type Logo = string;
export type Name = string;
export type Symbol = string;
export type Time = bigint;
export interface _SERVICE extends Directory {}
