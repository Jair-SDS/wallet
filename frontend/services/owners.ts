import { Principal } from "@dfinity/principal";
import { _SERVICE as OwnersActor } from "@candid/Owners/service.did";

export const getCodeFromVt = async (ownersActor: OwnersActor, authClient: string, linkId: string) => {
  try {
    const ownerID = await ownersActor.lookup(Principal.fromText(authClient));
    if (ownerID[0]) {
      const id = ownerID[0].toString(16);
      const link = BigInt(linkId).toString(16);
      return link.length.toString() + id + link;
    } else return undefined;
  } catch {
    return undefined;
  }
};

export const getPrincipalFromCode = async (ownersActor: OwnersActor, code: string) => {
  if (code.length > 2) {
    try {
      const size = Number(code[0]) + 1;
      const princCode = BigInt(`0x${code.slice(1, code.length - size)}`);
      const ownerPrinc = await ownersActor.get(princCode);
      return ownerPrinc;
    } catch {
      return undefined;
    }
  } else return undefined;
};
