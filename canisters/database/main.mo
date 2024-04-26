import AssocList "mo:base/AssocList";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat32 "mo:base/Nat32";
import Bool "mo:base/Bool";
import Nat "mo:base/Nat";
import Vector "mo:vector";

import DB "db";

actor class WalletDatabase() {

  type StableStorage<Asset, Contact, Allowance, HplSubaccount, HplVirtual, HplAsset, HplCount, HplContact> = AssocList.AssocList<Principal, (DB.DbInit<Asset, Text>, DB.DbInit<Contact, Text>, DB.DbInit<Allowance, Text>, DB.DbInit<HplSubaccount, Text>, DB.DbInit<HplVirtual, Text>, DB.DbInit<HplAsset, Text>, DB.DbInit<HplCount, Text>, DB.DbInit<HplContact, Text>)>;

  type AssetDocument_v0 = {
    sortIndex : Nat32;
    updatedAt : Nat32;
    deleted : Bool;
    address : Text;
    symbol : Text;
    name : Text;
    tokenName : Text;
    tokenSymbol : Text;
    decimal : Text;
    shortDecimal : Text;
    subAccounts : [{
      name : Text;
      sub_account_id : Text;
      address : Text;
      amount : Text;
      currency_amount : Text;
      transaction_fee : Text;
      decimal : Nat32;
      symbol : Text;
    }];
    index : Text;
    logo : Text;
    supportedStandards : [Text];
  };

  type ContactDocument_v0 = {
    name : Text;
    updatedAt : Nat32;
    deleted : Bool;
    principal : Text;
    accountIdentier : Text;
    assets : [{
      symbol : Text;
      tokenSymbol : Text;
      logo : Text;
      subaccounts : [{
        name : Text;
        subaccount_index : Text;
        sub_account_id : Text;
      }];
      address : Text;
      decimal : Text;
      shortDecimal : Text;
      supportedStandards : [Text];
    }];
  };

  type AllowanceDocument_v0 = {
    asset : {
      logo : Text;
      name : Text;
      symbol : Text;
      address : Text;
      decimal : Text;
      tokenName : Text;
      tokenSymbol : Text;
      supportedStandards : [Text];
    };
    id : Text;
    subAccountId : Text;
    spender : Text;
    updatedAt : Nat32;
    deleted : Bool;
  };

  type HplSubAccountDocument_v0 = {
    id : Text;
    name : Text;
    ftId : Text;
    ledger : Text;
    updatedAt : Nat32;
    deleted : Bool;
  };

  type HplVirtualDocument_v0 = {
    id : Text;
    name : Text;
    ftId : Text;
    accesBy : Text;
    isMint : Bool;
    updatedAt : Nat32;
    ledger : Text;
    deleted : Bool;
  };

  type HplAssetDocument_v0 = {
    id : Text;
    name : Text;
    symbol : Text;
    controller : Text;
    decimals : Text;
    description : Text;
    updatedAt : Nat32;
    ledger : Text;
    deleted : Bool;
  };

  type HplCountDocument_v0 = {
    nFtAssets : Text;
    nVirtualAccounts : Text;
    nAccounts : Text;
    updatedAt : Nat32;
    principal : Text;
    ledger : Text;
    deleted : Bool;
  };

  type HplContactDocument_v0 = {
    principal : Text;
    name : Text;
    remotes : [{
      name : Text;
      index : Text;
      status : Text;
      expired : Text;
      amount : Text;
      ftIndex : Text;
      code : Text;
    }];
    updatedAt : Nat32;
    ledger : Text;
    deleted : Bool;
  };

  stable var storage_v0 : StableStorage<AssetDocument_v0, ContactDocument_v0, AllowanceDocument_v0, HplSubAccountDocument_v0, HplVirtualDocument_v0, HplAssetDocument_v0, HplCountDocument_v0, HplContactDocument_v0> = null;

  type AssetDocument = AssetDocument_v0;
  type ContactDocument = ContactDocument_v0;
  type AllowanceDocument = AllowanceDocument_v0;
  type HplSubAccountDocument = HplSubAccountDocument_v0;
  type HplVirtualDocument = HplVirtualDocument_v0;
  type HplAssetDocument = HplAssetDocument_v0;
  type HplCountDocument = HplCountDocument_v0;
  type HplContactDocument = HplContactDocument_v0;

  var databasesCache : AssocList.AssocList<Principal, (DB.DbUse<AssetDocument, Text>, DB.DbUse<ContactDocument, Text>, DB.DbUse<AllowanceDocument, Text>, DB.DbUse<HplSubAccountDocument, Text>, DB.DbUse<HplVirtualDocument, Text>, DB.DbUse<HplAssetDocument, Text>, DB.DbUse<HplCountDocument, Text>, DB.DbUse<HplContactDocument, Text>)> = null;

  private func getDatabase(owner : Principal, notFoundStrategy : { #create; #returnNull }) : ?(DB.DbUse<AssetDocument, Text>, DB.DbUse<ContactDocument, Text>, DB.DbUse<AllowanceDocument, Text>, DB.DbUse<HplSubAccountDocument, Text>, DB.DbUse<HplVirtualDocument, Text>, DB.DbUse<HplAssetDocument, Text>, DB.DbUse<HplCountDocument, Text>, DB.DbUse<HplContactDocument, Text>) {
    switch (AssocList.find(databasesCache, owner, Principal.equal)) {
      case (?db) ?db;
      case (null) {
        let (tInit, cInit, aInit, hsInit, hvInit, haInit, hnInit, hcInit) = switch (AssocList.find(storage_v0, owner, Principal.equal)) {
          case (?store) store;
          case (null) {
            switch (notFoundStrategy) {
              case (#returnNull) return null;
              case (#create) {
                let store = (DB.empty<AssetDocument, Text>(), DB.empty<ContactDocument, Text>(), DB.empty<AllowanceDocument, Text>(), DB.empty<HplSubAccountDocument, Text>(), DB.empty<HplVirtualDocument, Text>(), DB.empty<HplAssetDocument, Text>(), DB.empty<HplCountDocument, Text>(), DB.empty<HplContactDocument, Text>());
                let (upd, _) = AssocList.replace(storage_v0, owner, Principal.equal, ?store);
                storage_v0 := upd;
                store;
              };
            };
          };
        };
        let db = (
          DB.use<AssetDocument, Text>(tInit, func(x) = x.address, Text.compare, func(x) = x.updatedAt),
          DB.use<ContactDocument, Text>(cInit, func(x) = x.principal, Text.compare, func(x) = x.updatedAt),
          DB.use<AllowanceDocument, Text>(aInit, func(x) = x.id, Text.compare, func(x) = x.updatedAt),
          DB.use<HplSubAccountDocument, Text>(hsInit, func(x) = x.id, Text.compare, func(x) = x.updatedAt),
          DB.use<HplVirtualDocument, Text>(hvInit, func(x) = x.id, Text.compare, func(x) = x.updatedAt),
          DB.use<HplAssetDocument, Text>(haInit, func(x) = x.id, Text.compare, func(x) = x.updatedAt),
          DB.use<HplCountDocument, Text>(hnInit, func(x) = x.principal, Text.compare, func(x) = x.updatedAt),
          DB.use<HplContactDocument, Text>(hcInit, func(x) = x.principal, Text.compare, func(x) = x.updatedAt),
        );
        let (upd, _) = AssocList.replace(databasesCache, owner, Principal.equal, ?db);
        databasesCache := upd;
        ?db;
      };
    };
  };

  public shared ({ caller }) func pushAssets(docs : [AssetDocument]) : async [AssetDocument] {
    let ?(tdb, _, _, _, _, _, _, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(tdb, docs);
  };

  public shared ({ caller }) func pushContacts(docs : [ContactDocument]) : async [ContactDocument] {
    let ?(_, cdb, _, _, _, _, _, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(cdb, docs);
  };

  public shared ({ caller }) func pushAllowances(docs : [AllowanceDocument]) : async [AllowanceDocument] {
    let ?(_, _, adb, _, _, _, _, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(adb, docs);
  };

  public shared ({ caller }) func pushHplSubaccounts(docs : [HplSubAccountDocument]) : async [HplSubAccountDocument] {
    let ?(_, _, _, hsdb, _, _, _, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(hsdb, docs);
  };

  public shared ({ caller }) func pushHplVirtuals(docs : [HplVirtualDocument]) : async [HplVirtualDocument] {
    let ?(_, _, _, _, hvdb, _, _, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(hvdb, docs);
  };

  public shared ({ caller }) func pushHplAssets(docs : [HplAssetDocument]) : async [HplAssetDocument] {
    let ?(_, _, _, _, _, hadb, _, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(hadb, docs);
  };

  public shared ({ caller }) func pushHplCount(docs : [HplCountDocument]) : async [HplCountDocument] {
    let ?(_, _, _, _, _, _, hndb, _) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(hndb, docs);
  };

  public shared ({ caller }) func pushHplContacts(docs : [HplContactDocument]) : async [HplContactDocument] {
    let ?(_, _, adb, _, _, _, _, hcdb) = getDatabase(caller, #create) else Debug.trap("Can never happen");
    DB.pushUpdates(hcdb, docs);
  };

  public shared query ({ caller }) func pullAssets(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [AssetDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(tdb, _, _, _, _, _, _, _)) DB.getLatest(tdb, updatedAt, lastId, limit);
      case (null) [];
    };
  };

  public shared query ({ caller }) func pullContacts(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [ContactDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, cdb, _, _, _, _, _, _)) DB.getLatest(cdb, updatedAt, lastId, limit);
      case (null) [];
    };
  };

  public shared query ({ caller }) func pullAllowances(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [AllowanceDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, _, adb, _, _, _, _, _)) DB.getLatest(adb, updatedAt, lastId, limit);
      case (null) [];
    };
  };

  public shared query ({ caller }) func pullHplSubaccounts(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [HplSubAccountDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, _, _, hsdb, _, _, _, _)) DB.getLatest(hsdb, updatedAt, lastId, limit);
      case (null) [];
    };
  };
  public shared query ({ caller }) func pullHplVirtuals(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [HplVirtualDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, _, _, _, hvdb, _, _, _)) DB.getLatest(hvdb, updatedAt, lastId, limit);
      case (null) [];
    };
  };
  public shared query ({ caller }) func pullHplAssets(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [HplAssetDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, _, _, _, _, hadb, _, _)) DB.getLatest(hadb, updatedAt, lastId, limit);
      case (null) [];
    };
  };
  public shared query ({ caller }) func pullHplCount(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [HplCountDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, _, adb, _, _, _, hndb, _)) DB.getLatest(hndb, updatedAt, lastId, limit);
      case (null) [];
    };
  };
  public shared query ({ caller }) func pullHplContacts(updatedAt : Nat32, lastId : ?Text, limit : Nat) : async [HplContactDocument] {
    switch (getDatabase(caller, #returnNull)) {
      case (?(_, _, adb, _, _, _, _, hcdb)) DB.getLatest(hcdb, updatedAt, lastId, limit);
      case (null) [];
    };
  };

  public shared query ({ caller }) func dump() : async [(Principal, ([?AssetDocument], [?ContactDocument], [?AllowanceDocument], [?HplSubAccountDocument], [?HplVirtualDocument], [?HplAssetDocument], [?HplCountDocument], [?HplContactDocument]))] {
    Iter.toArray<(Principal, ([?AssetDocument], [?ContactDocument], [?AllowanceDocument], [?HplSubAccountDocument], [?HplVirtualDocument], [?HplAssetDocument], [?HplCountDocument], [?HplContactDocument]))>(
      Iter.map<(Principal, (DB.DbInit<AssetDocument, Text>, DB.DbInit<ContactDocument, Text>, DB.DbInit<AllowanceDocument, Text>, DB.DbInit<HplSubAccountDocument, Text>, DB.DbInit<HplVirtualDocument, Text>, DB.DbInit<HplAssetDocument, Text>, DB.DbInit<HplCountDocument, Text>, DB.DbInit<HplContactDocument, Text>)), (Principal, ([?AssetDocument], [?ContactDocument], [?AllowanceDocument], [?HplSubAccountDocument], [?HplVirtualDocument], [?HplAssetDocument], [?HplCountDocument], [?HplContactDocument]))>(
        List.toIter(storage_v0),
        func((p, (t, c, a, hs, hv, ha, hn, hc))) = (p, (Vector.toArray<?AssetDocument>(t.db.vec), Vector.toArray<?ContactDocument>(c.db.vec), Vector.toArray<?AllowanceDocument>(a.db.vec), Vector.toArray<?HplSubAccountDocument>(hs.db.vec), Vector.toArray<?HplVirtualDocument>(hv.db.vec), Vector.toArray<?HplAssetDocument>(ha.db.vec), Vector.toArray<?HplCountDocument>(hn.db.vec), Vector.toArray<?HplContactDocument>(hc.db.vec))),
      )
    );
  };

  public shared query ({ caller }) func doesStorageExist() : async Bool {
    switch (AssocList.find(databasesCache, caller, Principal.equal)) {
      case (?db) true;
      case (null) false;
    };
  };

};
