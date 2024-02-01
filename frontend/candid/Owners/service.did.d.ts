import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export interface OwnerIngressAPI {
  lookup: ActorMethod<[Principal], [] | [bigint]>;
  get: ActorMethod<[bigint], Principal>;
}

export interface _SERVICE extends OwnerIngressAPI {}
