import { DatabaseOptions, IWalletDatabase } from "@/database/i-wallet-database";
import { createRxDatabase, RxCollection, RxDocument, RxDatabase, addRxPlugin } from "rxdb";
import DBSchemas from "./schemas.json";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from "rxjs";
import { extractValueFromArray, setupReplication } from "./helpers";
import { defaultTokens } from "@/common/defaultTokens";
// rxdb plugins
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxReplicationState } from "rxdb/plugins/replication";
// candid
import { AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";
import { createActor } from "@/candid/database";
// types
import { Contact } from "@redux/models/ContactsModels";
import { TAllowance } from "@/@types/allowance";
import { SupportedStandardEnum } from "@/@types/icrc";
import {
  AssetDocument as AssetRxdbDocument,
  ContactDocument as ContactRxdbDocument,
  AllowanceDocument as AllowanceRxdbDocument,
  HplSubAccountDocument as HplSubAccountRxdbDocument,
  HplVirtualDocument as HplVirtualRxdbDocument,
  HplAssetDocument as HplAssetRxdbDocument,
  HplCountDocument as HplCountRxdbDocument,
  HplContactDocument as HplContactRxdbDocument,
} from "@/candid/database/db.did";
import { Asset, HPLAssetData, HPLSubData, HPLVirtualData, HplContact, nHplData } from "@redux/models/AccountModels";
import store from "@redux/Store";
import {
  addReduxAsset,
  deleteReduxAsset,
  setAccordionAssetIdx,
  setAssets,
  updateReduxAsset,
} from "@redux/assets/AssetReducer";
import {
  addReduxContact,
  deleteReduxContact,
  setReduxContacts,
  updateReduxContact,
} from "@redux/contacts/ContactsReducer";
import {
  addReduxAllowance,
  deleteReduxAllowance,
  setReduxAllowances,
  updateReduxAllowance,
} from "@redux/allowance/AllowanceReducer";
import { Principal } from "@dfinity/principal";
import logger from "@/common/utils/logger";

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBDevModePlugin);

export class RxdbDatabase extends IWalletDatabase {
  // Singleton pattern
  private static _instance: RxdbDatabase | undefined;
  public static get instance(): RxdbDatabase {
    if (!this._instance) {
      this._instance = new RxdbDatabase();
    }
    return this._instance!;
  }

  private principalId = "";
  private hplLedger = "rqx66-eyaaa-aaaap-aaona-cai";
  private identity: Identity = new AnonymousIdentity();
  private readonly agent = new HttpAgent({ identity: this.identity, host: import.meta.env.VITE_DB_CANISTER_HOST });
  private replicaCanister: any;

  private _assets!: RxCollection<AssetRxdbDocument> | null;
  private assetsReplicationState?: RxReplicationState<any, any>;
  private assetsPullInterval?: any;
  private _contacts!: RxCollection<ContactRxdbDocument> | null;
  private contactsReplicationState?: RxReplicationState<any, any>;
  private contactsPullInterval?: any;
  private _allowances!: RxCollection<AllowanceRxdbDocument> | null;
  private allowancesReplicationState?: RxReplicationState<any, any>;
  private allowancesPullInterval?: any;
  // HPL
  private _hplsubaccounts!: RxCollection<HplSubAccountRxdbDocument> | null;
  private hplSubaccountsReplicationState?: RxReplicationState<any, any>;
  private hplSubaccountsPullInterval?: any;
  private _hplvirtuals!: RxCollection<HplVirtualRxdbDocument> | null;
  private hplVirtualsReplicationState?: RxReplicationState<any, any>;
  private hplVirtualsPullInterval?: any;
  private _hplassets!: RxCollection<HplAssetRxdbDocument> | null;
  private hplAssetsReplicationState?: RxReplicationState<any, any>;
  private hplAssetsPullInterval?: any;
  private _hplcount!: RxCollection<HplCountRxdbDocument> | null;
  private hplCountReplicationState?: RxReplicationState<any, any>;
  private hplCountPullInterval?: any;
  private _hplcontacts!: RxCollection<HplContactRxdbDocument> | null;
  private hplContactsReplicationState?: RxReplicationState<any, any>;
  private hplContactsPullInterval?: any;

  private pullingAssets$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingAssets$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pullingContacts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingContacts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pullingAllowances$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingAllowances$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // HPL
  private pullingHplSubaccounts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingHplSubaccounts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pullingHplVirtuals$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingHplVirtuals$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pullingHplAssets$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingHplAssets$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pullingHplCount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingHplCount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pullingHplContacts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private pushingHplContacts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  protected get assets(): Promise<RxCollection<AssetRxdbDocument> | null> {
    if (this._assets) return Promise.resolve(this._assets);
    return this.init().then(() => this._assets);
  }

  protected get contacts(): Promise<RxCollection<ContactRxdbDocument> | null> {
    if (this._contacts) return Promise.resolve(this._contacts);
    return this.init().then(() => this._contacts);
  }

  protected get allowances(): Promise<RxCollection<AllowanceRxdbDocument> | null> {
    if (this._allowances) return Promise.resolve(this._allowances);
    return this.init().then(() => this._allowances);
  }

  protected get hplSubaccounts(): Promise<RxCollection<HplSubAccountRxdbDocument> | null> {
    if (this._hplsubaccounts) return Promise.resolve(this._hplsubaccounts);
    return this.init().then(() => this._hplsubaccounts);
  }

  protected get hplVirtuals(): Promise<RxCollection<HplVirtualRxdbDocument> | null> {
    if (this._hplvirtuals) return Promise.resolve(this._hplvirtuals);
    return this.init().then(() => this._hplvirtuals);
  }

  protected get hplAssets(): Promise<RxCollection<HplAssetRxdbDocument> | null> {
    if (this._hplassets) return Promise.resolve(this._hplassets);
    return this.init().then(() => this._hplassets);
  }

  protected get hplCounts(): Promise<RxCollection<HplCountRxdbDocument> | null> {
    if (this._hplcount) return Promise.resolve(this._hplcount);
    return this.init().then(() => this._hplcount);
  }

  protected get hplContacts(): Promise<RxCollection<HplContactRxdbDocument> | null> {
    if (this._hplcontacts) return Promise.resolve(this._hplcontacts);
    return this.init().then(() => this._hplcontacts);
  }

  /**
   * Initialize the rxdb object, adding the collections and setting up the replication.
   * @returns Promise<void>
   * @throws Error
   */
  async init(): Promise<void> {
    try {
      if (
        import.meta.env.VITE_DB_CANISTER_HOST!.includes("localhost") ||
        import.meta.env.VITE_DB_CANISTER_HOST!.includes("127.0.0.1")
      ) {
        await this.agent.fetchRootKey();
      }

      const db: RxDatabase = await createRxDatabase({
        name: `local_db_${this.principalId}`,
        storage: getRxStorageDexie(),
        ignoreDuplicate: true,
        eventReduce: true,
      });

      const { assets, contacts, allowances, hplsubaccounts, hplvirtuals, hplassets, hplcounts, hplcontacts } =
        await db.addCollections(DBSchemas);

      const assetsReplication = await setupReplication<AssetRxdbDocument, string>(
        assets,
        `assets-${this.principalId}`,
        "address",
        (items) => this._assetsPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._assetsPullHandler(minTimestamp, lastId, batchSize),
      );

      [this.assetsReplicationState, this.assetsPullInterval, this.pushingAssets$, this.pullingAssets$] =
        assetsReplication;

      const contactsReplication = await setupReplication<ContactRxdbDocument, string>(
        contacts,
        `contacts-${this.principalId}`,
        "principal",
        (items) => this._contactsPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._contactsPullHandler(minTimestamp, lastId, batchSize),
      );

      [this.contactsReplicationState, this.contactsPullInterval, this.pushingContacts$, this.pullingContacts$] =
        contactsReplication;

      const allowancesReplication = await setupReplication<AllowanceRxdbDocument, string>(
        allowances,
        `allowances-${this.principalId}`,
        "id",
        (items) => this._allowancesPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._allowancesPullHandler(minTimestamp, lastId, batchSize),
      );

      [this.allowancesReplicationState, this.allowancesPullInterval, this.pushingAllowances$, this.pullingAllowances$] =
        allowancesReplication;

      const hplSubaccountsReplication = await setupReplication<HplSubAccountRxdbDocument, string>(
        hplsubaccounts,
        `hplSUB-${this.principalId}`,
        "id",
        (items) => this._hplSubaccountsPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._hplSubaccountsPullHandler(minTimestamp, lastId, batchSize),
      );

      [
        this.hplSubaccountsReplicationState,
        this.hplSubaccountsPullInterval,
        this.pushingHplSubaccounts$,
        this.pullingHplSubaccounts$,
      ] = hplSubaccountsReplication;

      const hplVirtualsReplication = await setupReplication<HplVirtualRxdbDocument, string>(
        hplvirtuals,
        `hplVT-${this.principalId}`,
        "id",
        (items) => this._hplVirtualsPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._hplVirtualsPullHandler(minTimestamp, lastId, batchSize),
      );

      [
        this.hplVirtualsReplicationState,
        this.hplVirtualsPullInterval,
        this.pushingHplVirtuals$,
        this.pullingHplVirtuals$,
      ] = hplVirtualsReplication;

      const hplAssetsReplication = await setupReplication<HplAssetRxdbDocument, string>(
        hplassets,
        `hplFT-${this.principalId}`,
        "id",
        (items) => this._hplAssetsPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._hplAssetsPullHandler(minTimestamp, lastId, batchSize),
      );

      [this.hplAssetsReplicationState, this.hplAssetsPullInterval, this.pushingHplAssets$, this.pullingHplAssets$] =
        hplAssetsReplication;

      const hplCountReplication = await setupReplication<HplCountRxdbDocument, string>(
        hplcounts,
        `nHpl-${this.principalId}`,
        "principal",
        (items) => this._hplCountPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._hplCountPullHandler(minTimestamp, lastId, batchSize),
      );

      [this.hplCountReplicationState, this.hplCountPullInterval, this.pushingHplCount$, this.pullingHplCount$] =
        hplCountReplication;

      const hplContactsReplication = await setupReplication<HplContactRxdbDocument, string>(
        hplcontacts,
        `hpl-contacts-${this.principalId}`,
        "principal",
        (items) => this._hplContactsPushHandler(items),
        (minTimestamp, lastId, batchSize) => this._hplContactsPullHandler(minTimestamp, lastId, batchSize),
      );

      [
        this.hplContactsReplicationState,
        this.hplContactsPullInterval,
        this.pushingHplContacts$,
        this.pullingHplContacts$,
      ] = hplContactsReplication;

      this._assets = assets;
      this._contacts = contacts;
      this._allowances = allowances;
      this._hplsubaccounts = hplsubaccounts;
      this._hplvirtuals = hplvirtuals;
      this._hplassets = hplassets;
      this._hplcount = hplcounts;
      this._hplcontacts = hplcontacts;
    } catch (e) {
      logger.debug("RxDb Init:", e);
    }
  }

  /**
   * Set Identity object or fixed Principal ID
   * as current active agent.
   * @param identity Identity object
   * @param principalId Principal ID
   * @param fixedPrincipal Watch-only login Principal ID
   */
  async setIdentity(identity: Identity | null, fixedPrincipal?: Principal, hplLedgerCanister?: string): Promise<void> {
    this._invalidateDb();
    this.identity = identity || new AnonymousIdentity();
    this.agent.replaceIdentity(this.identity);
    this.principalId = fixedPrincipal?.toString() || this.identity?.getPrincipal().toText() || "";
    this.hplLedger = hplLedgerCanister || "rqx66-eyaaa-aaaap-aaona-cai";

    // Don't allow watch-only mode to use the DB
    if (!this.identity.getPrincipal().isAnonymous()) {
      this.replicaCanister = createActor(this.getCustomDbCanisterId() || import.meta.env.VITE_DB_CANISTER_ID, {
        agent: this.agent,
      });
      await this.init();
      await this._doesRecordByPrincipalExist();
      await this._assetStateSync();
      await this._contactStateSync();
      await this._allowanceStateSync();
    }
  }

  /**
   * Set Hpl Ledger canister
   * @param hplLedgerCanister string
   */
  async setHplLedger(hplLedgerCanister: string): Promise<void> {
    this.hplLedger = hplLedgerCanister || "rqx66-eyaaa-aaaap-aaona-cai";
  }

  /**
   * Get a Asset object by its ID.
   * @param address Address ID of a Asset object
   * @returns Asset object or NULL if not found
   */
  async getAsset(address: string): Promise<Asset | null> {
    try {
      const doc = await (await this.assets)?.findOne(address).exec();
      return (doc && this._mapAssetDoc(doc)) || null;
    } catch (e) {
      logger.debug("RxDb GetAsset:", e);
      return null;
    }
  }

  /**
   * Get all Asset objects from the active agent.
   * @returns Array of found Asset objects or an empty
   * array if no Asset objects were found
   */
  async getAssets(): Promise<Asset[]> {
    try {
      const documents = await (await this.assets)?.find().exec();
      return (documents && documents.map(this._mapAssetDoc)) || [];
    } catch (e) {
      logger.debug("RxDb GetAssets:", e);
      return [];
    }
  }
  /**
   * Sync the Asset state with the Redux store.
   * @param newAssets Array of Asset objects
   */
  private async _assetStateSync(newAssets?: Asset[]): Promise<void> {
    const documents = await (await this.assets)?.find().exec();
    const result = (documents && documents.map(this._mapAssetDoc)) || [];
    const assets = newAssets || result || [];
    store.dispatch(setAssets(assets));
    store.dispatch(setAccordionAssetIdx([assets[0].tokenSymbol]));
  }

  /**
   * Add a new Asset object to the list of Asset objects
   * current active agent has.
   * @param asset Asset object to be added
   */
  async addAsset(asset: Asset, options?: DatabaseOptions): Promise<void> {
    try {
      await (
        await this.assets
      )?.insert({
        ...asset,
        logo: extractValueFromArray(asset.logo),
        index: extractValueFromArray(asset.index),
        deleted: false,
        updatedAt: Date.now(),
      });

      if (options?.sync) store.dispatch(addReduxAsset(asset));
    } catch (e) {
      logger.debug("RxDb AddAsset:", e);
    }
  }

  async updateAssets(newAssets: Asset[], options?: DatabaseOptions): Promise<void> {
    try {
      await (
        await this.assets
      )?.bulkUpsert(
        newAssets.map((a) => ({
          ...a,
          logo: extractValueFromArray(a.logo),
          index: extractValueFromArray(a.index),
          deleted: false,
          updatedAt: Date.now(),
        })),
      );
      if (options?.sync) await this._assetStateSync();
    } catch (e) {
      logger.debug("RxDb UpdateAssets:", e);
    }
  }

  /**
   * Find a Asset object by its ID and replace it with
   * another Asset object with the date of update.
   * @param address Address ID of a Asset object
   * @param newDoc Asset object
   */
  async updateAsset(address: string, newDoc: Asset, options?: DatabaseOptions): Promise<void> {
    try {
      const document = await (await this.assets)?.findOne(address).exec();
      await document?.patch({
        ...newDoc,
        logo: extractValueFromArray(newDoc.logo),
        index: extractValueFromArray(newDoc.index),
        deleted: false,
        updatedAt: Date.now(),
      });

      if (options?.sync) store.dispatch(updateReduxAsset(newDoc));
    } catch (e) {
      logger.debug("RxDb UpdateAsset:", e);
    }
  }

  /**
   * Find and remove a Asset object by its ID.
   * @param address Address ID of a Asset object
   */
  async deleteAsset(address: string, options?: DatabaseOptions): Promise<void> {
    try {
      const document = await (await this.assets)?.findOne(address).exec();
      await document?.remove();

      if (options?.sync) store.dispatch(deleteReduxAsset(address));
    } catch (e) {
      logger.debug("RxDb DeleteAsset", e);
    }
  }

  /**
   * Find a Contact object by its Principal ID.
   * @param principal Princial ID
   * @returns Contact object or NULL if not found
   */
  async getContact(principal: string): Promise<Contact | null> {
    try {
      const document = await (await this.contacts)?.findOne(principal).exec();
      return (document && this._mapContactDoc(document)) || null;
    } catch (e) {
      logger.debug("RxDb GetContact", e);
      return null;
    }
  }

  async _contactStateSync(newContacts?: Contact[]): Promise<void> {
    const documents = await (await this.contacts)?.find().exec();
    const result = (documents && documents.map(this._mapContactDoc)) || [];
    const contacts = newContacts || result || [];
    store.dispatch(setReduxContacts(contacts));
  }

  /**
   * Get all Contact objects from active agent.
   * @returns Array of found Contact objects or an empty
   * array if no Contact object were found
   */
  async getContacts(): Promise<Contact[]> {
    try {
      const documents = await (await this.contacts)?.find().exec();
      return (documents && documents.map(this._mapContactDoc)) || [];
    } catch (e) {
      logger.debug("RxDb GetContacts", e);
      return [];
    }
  }

  /**
   * Add a new Contact object to the list of Contact objects
   * current active agent has.
   * @param contact Contact object to be added
   */
  async addContact(contact: Contact, options?: DatabaseOptions): Promise<void> {
    try {
      const databaseContact = this._getStorableContact(contact);

      await (
        await this.contacts
      )?.insert({
        ...databaseContact,
        accountIdentier: extractValueFromArray(databaseContact.accountIdentier),
        assets: databaseContact.assets.map((a) => ({
          ...a,
          logo: extractValueFromArray(a.logo),
          subaccounts: a.subaccounts.map((sa) => ({
            ...sa,
            allowance: [sa.allowance],
          })),
        })),
        deleted: false,
        updatedAt: Date.now(),
      });

      if (options?.sync) store.dispatch(addReduxContact(contact));
    } catch (e) {
      logger.debug("RxDb AddContact", e);
    }
  }

  /**
   * Find a Contact object by its Principal ID and replace it
   * with another Contact object with the date of update.
   * @param principal Principal ID
   * @param newDoc Contact object
   */
  async updateContact(principal: string, newDoc: Contact, options?: DatabaseOptions): Promise<void> {
    try {
      const databaseContact = this._getStorableContact(newDoc);
      const document = await (await this.contacts)?.findOne(principal).exec();

      document?.patch({
        ...databaseContact,
        accountIdentier: extractValueFromArray(databaseContact.accountIdentier),
        assets: databaseContact.assets.map((a) => ({
          ...a,
          logo: extractValueFromArray(a.logo),
          subaccounts: a.subaccounts.map((sa) => ({
            ...sa,
            allowance: [sa.allowance],
          })),
        })),
        deleted: false,
        updatedAt: Date.now(),
      });

      if (options?.sync) store.dispatch(updateReduxContact(newDoc));
    } catch (e) {
      logger.debug("RxDb UpdateContact", e);
    }
  }

  /**
   * Update Contacts in bulk.
   * @param newDocs Array of Allowance objects
   */
  async updateContacts(newDocs: Contact[]): Promise<void> {
    try {
      const databaseContacts = newDocs.map((contact) => this._getStorableContact(contact));

      await (
        await this.contacts
      )?.bulkUpsert(
        databaseContacts.map((doc) => ({
          ...doc,
          accountIdentier: extractValueFromArray(doc.accountIdentier),
          assets: doc.assets.map((a) => ({
            ...a,
            logo: extractValueFromArray(a.logo),
            subaccounts: a.subaccounts.map((sa) => ({
              ...sa,
              allowance: [sa.allowance],
            })),
          })),
          deleted: false,
          updatedAt: Date.now(),
        })),
      );

      store.dispatch(setReduxContacts(newDocs));
    } catch (e) {
      logger.debug("RxDb UpdateContacts", e);
    }
  }

  /**
   * Find and remove a Contact object by its Principal ID.
   * @param principal Principal ID
   */
  async deleteContact(principal: string, options?: DatabaseOptions): Promise<void> {
    try {
      const document = await (await this.contacts)?.findOne(principal).exec();
      await document?.remove();
      if (options?.sync) store.dispatch(deleteReduxContact(principal));
    } catch (e) {
      logger.debug("RxDb DeleteContact", e);
    }
  }

  private _getStorableContact(contact: Contact): Contact {
    return {
      ...contact,
      assets: contact.assets.map((asset) => ({
        ...asset,
        subaccounts: asset.subaccounts.map((subaccount) => {
          // eslint-disable-next-line
          const { allowance, ...rest } = subaccount;
          return { ...rest };
        }),
      })),
    };
  }

  /**
   * Find a Allowance object.
   * @param id Primary Key
   * @returns Allowance object or NULL if not found
   */
  async getAllowance(id: string): Promise<TAllowance | null> {
    try {
      const document = await (await this.allowances)?.findOne(id).exec();
      return (document && this._mapAllowanceDoc(document)) || null;
    } catch (e) {
      logger.debug("RxDb GetAllowance", e);
      return null;
    }
  }

  private async _allowanceStateSync(newAllowances?: TAllowance[]): Promise<void> {
    const documents = await (await this.allowances)?.find().exec();
    const result = (documents && documents.map(this._mapAllowanceDoc)) || [];
    const allowances = newAllowances || result || [];
    store.dispatch(setReduxAllowances(allowances));
  }

  /**
   * Get all Allowance objects from active agent.
   * @returns Array of found Allowance objects or an empty
   * array if no Allowance object were found
   */
  async getAllowances(): Promise<TAllowance[]> {
    try {
      const documents = await (await this.allowances)?.find().exec();
      return (documents && documents.map(this._mapAllowanceDoc)) || [];
    } catch (e) {
      logger.debug("RxDb GetAllowances", e);
      return [];
    }
  }

  /**
   * Add a new Allowance object to the list of Allowance objects
   * current active agent has.
   * @param allowance Allowance object to be added
   */
  async addAllowance(allowance: TAllowance, options?: DatabaseOptions): Promise<void> {
    const databaseAllowance = this._getStorableAllowance(allowance);

    try {
      await (
        await this.allowances
      )?.insert({
        ...databaseAllowance,
        asset: {
          ...databaseAllowance.asset,
          logo: extractValueFromArray(databaseAllowance.asset?.logo),
        },
        deleted: false,
        updatedAt: Date.now(),
      });

      if (options?.sync) store.dispatch(addReduxAllowance(allowance));
    } catch (e) {
      logger.debug("RxDb AddAllowance", e);
    }
  }

  /**
   * Find a Allowance object and replace it
   * with another Allowance object with the date of update.
   * @param id Primary Key
   * @param newDoc Allowance object
   */
  async updateAllowance(id: string, newDoc: TAllowance, options?: DatabaseOptions): Promise<void> {
    try {
      const databaseAllowance = this._getStorableAllowance(newDoc);
      const document = await (await this.allowances)?.findOne(id).exec();

      document?.patch({
        ...databaseAllowance,
        asset: {
          ...databaseAllowance.asset,
          logo: extractValueFromArray(databaseAllowance.asset?.logo),
        },
        deleted: false,
        updatedAt: Date.now(),
      });

      if (options?.sync) store.dispatch(updateReduxAllowance(newDoc));
    } catch (e) {
      logger.debug("RxDb UpdateAllowance", e);
    }
  }

  /**
   * Update Allowances in bulk.
   * @param newDocs Array of Allowance objects
   */
  async updateAllowances(newDocs: TAllowance[], options?: DatabaseOptions): Promise<void> {
    try {
      const databaseAllowances = newDocs.map((allowance) => this._getStorableAllowance(allowance));

      await (
        await this.allowances
      )?.bulkUpsert(
        databaseAllowances.map((doc) => ({
          ...doc,
          asset: {
            ...doc.asset,
            logo: extractValueFromArray(doc.asset?.logo),
          },
          deleted: false,
          updatedAt: Date.now(),
        })),
      );

      if (options?.sync) store.dispatch(setReduxAllowances(newDocs));
    } catch (e) {
      logger.debug("RxDb UpdateAllowances", e);
    }
  }

  /**
   * Find and remove a Allowance object.
   * @param id Primary Key
   */
  async deleteAllowance(id: string, options?: DatabaseOptions): Promise<void> {
    try {
      const document = await (await this.allowances)?.findOne(id).exec();
      await document?.remove();

      if (options?.sync) store.dispatch(deleteReduxAllowance(id));
    } catch (e) {
      logger.debug("RxDb DeleteAllowance", e);
    }
  }

  private _getStorableAllowance(allowance: TAllowance): Pick<TAllowance, "id" | "asset" | "subAccountId" | "spender"> {
    // eslint-disable-next-line
    const { amount, expiration, ...rest } = allowance;
    return { ...rest };
  }

  /**
   * Get all Hpl Subaccount objects from the active agent.
   * @returns Array of found Hpl Subaccount objects or an empty
   * array if no Asset objects were found
   */
  async getHplSubaccounts(): Promise<HPLSubData[]> {
    try {
      const documents = await (await this.hplSubaccounts)?.find().exec();
      console.log("getHplSubaccounts:", documents);

      return (
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger === this.hplLedger;
            })
            .map(this._mapHplSubaccount)) ||
        []
      );
    } catch (e) {
      console.error("RxDb GetHplSubaccounts:", e);
      return [];
    }
  }

  /**
   * Set a Hpl Subaccount objects to
   * current active agent has.
   * @param newSubs HPLSubData array to be seted
   */
  async updateHplSubaccounts(newSubs: HPLSubData[]): Promise<void> {
    try {
      await (
        await this.hplSubaccounts
      )?.bulkUpsert(
        newSubs.map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplSubaccounts:", e);
    }
  }

  /**
   * Set a Hpl Subaccount objects by Ledger to
   * current active agent has.
   * @param newSubs HPLSubData array to be seted
   */
  async updateHplSubaccountsByLedger(newSubs: HPLSubData[]): Promise<void> {
    console.log("updateHplSubaccountsByLedger");

    try {
      const documents = (await (await this.hplSubaccounts)?.find().exec()) || [];
      const subs =
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger !== this.hplLedger;
            })
            .map(this._mapHplSubaccount)) ||
        [];

      console.log("mewdata:", [...newSubs, ...subs]);

      await (
        await this.hplSubaccounts
      )?.bulkUpsert(
        [...newSubs, ...subs].map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplSubaccounts:", e);
    }
  }

  /**
   * Get all Hpl Virtual objects from the active agent.
   * @returns Array of found Hpl Virtual objects or an empty
   * array if no Asset objects were found
   */
  async getHplVirtuals(): Promise<HPLVirtualData[]> {
    try {
      const documents = await (await this.hplVirtuals)?.find().exec();
      return (
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger === this.hplLedger;
            })
            .map(this._mapHplVirtual)) ||
        []
      );
    } catch (e) {
      console.error("RxDb GetHplVirtuals:", e);
      return [];
    }
  }

  /**
   * Set a Hpl Virtual objects by Ledger to
   * current active agent has.
   * @param newVts HPLVirtualData array to be seted
   */
  async updateHplVirtuals(newVts: HPLVirtualData[]): Promise<void> {
    try {
      await (
        await this.hplVirtuals
      )?.bulkUpsert(
        newVts.map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplVirtuals:", e);
    }
  }

  /**
   * Set a Hpl Virtual objects by Ledger to
   * current active agent has.
   * @param newVts HPLVirtualData array to be seted
   */
  async updateHplVirtualsByLedger(newVts: HPLVirtualData[]): Promise<void> {
    try {
      const documents = await (await this.hplVirtuals)?.find().exec();
      const virtuals =
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger !== this.hplLedger;
            })
            .map(this._mapHplVirtual)) ||
        [];
      await (
        await this.hplVirtuals
      )?.bulkUpsert(
        [...virtuals, ...newVts].map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplVirtuals:", e);
    }
  }

  /**
   * Get all Hpl Assets objects from the active agent.
   * @returns Array of found Hpl Assets objects or an empty
   * array if no Asset objects were found
   */
  async getHplAssets(): Promise<HPLAssetData[]> {
    try {
      const documents = await (await this.hplAssets)?.find().exec();
      return (
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger === this.hplLedger;
            })
            .map(this._mapHplAsset)) ||
        []
      );
    } catch (e) {
      console.error("RxDb GetHplAssets:", e);
      return [];
    }
  }

  /**
   * Set a Hpl Assets objects to
   * current active agent has.
   * @param newFTs HPLAssetData array to be seted
   */
  async updateHplAssets(newFTs: HPLAssetData[]): Promise<void> {
    try {
      await (
        await this.hplAssets
      )?.bulkUpsert(
        newFTs.map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplAssets:", e);
    }
  }

  /**
   * Set a Hpl Assets objects by Ledger to
   * current active agent has.
   * @param newFTs HPLAssetData array to be seted
   */
  async updateHplAssetsByLedger(newFTs: HPLAssetData[]): Promise<void> {
    try {
      const documents = await (await this.hplAssets)?.find().exec();
      const assets =
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger !== this.hplLedger;
            })
            .map(this._mapHplAsset)) ||
        [];
      await (
        await this.hplAssets
      )?.bulkUpsert(
        [...assets, ...newFTs].map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplAssets:", e);
    }
  }

  /**
   * Get all Hpl Count objects from the active agent.
   * @returns Array of found Hpl Count objects or an empty
   * array if no Asset objects were found
   */
  async getHplCount(): Promise<nHplData[]> {
    try {
      const documents = await (await this.hplCounts)?.find().exec();
      return (
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger === this.hplLedger;
            })
            .map(this._mapHplCount)) ||
        []
      );
    } catch (e) {
      console.error("RxDb GetHplCount:", e);
      return [];
    }
  }

  /**
   * Set a Hpl Count objects to
   * current active agent has.
   * @param newCounts nHplData array to be seted
   */
  async updateHplCount(newCounts: nHplData[]): Promise<void> {
    try {
      await (
        await this.hplCounts
      )?.bulkUpsert(
        newCounts.map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
          principal: this.principalId,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplCount:", e);
    }
  }

  /**
   * Set a Hpl Count objects by Ledger to
   * current active agent has.
   * @param newCounts nHplData array to be seted
   */
  async updateHplCountByLedger(newCounts: nHplData[]): Promise<void> {
    try {
      const documents = await (await this.hplCounts)?.find().exec();
      const count =
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger !== this.hplLedger;
            })
            .map(this._mapHplCount)) ||
        [];
      await (
        await this.hplCounts
      )?.bulkUpsert(
        [...count, ...newCounts].map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
          principal: this.principalId,
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplCount:", e);
    }
  }

  /**
   * Get all Hpl Contact objects from the active agent.
   * @returns Array of found Hpl Contact objects or an empty
   * array if no Asset objects were found
   */
  async getHplContacts(): Promise<HplContact[]> {
    try {
      const documents = await (await this.hplContacts)?.find().exec();
      return (
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger === this.hplLedger;
            })
            .map(this._mapHplContact)) ||
        []
      );
    } catch (e) {
      console.error("RxDb GetHplContacts:", e);
      return [];
    }
  }

  /**
   * Set a Hpl Contact objects to
   * current active agent has.
   * @param newContacts HplContact array to be seted
   */
  async updateHplContacts(newContacts: HplContact[]): Promise<void> {
    try {
      await (
        await this.hplContacts
      )?.bulkUpsert(
        newContacts.map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
          remotes: a.remotes.map((rmt) => ({
            ...rmt,
            expired: rmt.expired.toString(),
          })),
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplContacts:", e);
    }
  }

  /**
   * Set a Hpl Contact objects by Ledger to
   * current active agent has.
   * @param newContacts HplContact array to be seted
   */
  async updateHplContactsByLedger(newContacts: HplContact[]): Promise<void> {
    try {
      const documents = await (await this.hplContacts)?.find().exec();
      const contacts =
        (documents &&
          documents
            .filter((doc) => {
              return doc._data.ledger !== this.hplLedger;
            })
            .map(this._mapHplContact)) ||
        [];
      await (
        await this.hplContacts
      )?.bulkUpsert(
        [...contacts, ...newContacts].map((a) => ({
          ...a,
          deleted: false,
          updatedAt: Date.now(),
          ledger: this.hplLedger,
          remotes: a.remotes.map((rmt) => ({
            ...rmt,
            expired: rmt.expired.toString(),
          })),
        })),
      );
    } catch (e) {
      console.error("RxDb UpdateHplContacts:", e);
    }
  }
  /**
   * Obserbable that triggers after documents were pulled from the DB.
   * @returns Array of Assets and Contacts objects pulled from the DB
   */
  subscribeOnPulling(): Observable<boolean> {
    return combineLatest([
      this.pullingAssets$,
      this.pullingContacts$,
      this.pullingAllowances$,
      this.pullingHplSubaccounts$,
      this.pullingHplVirtuals$,
      this.pullingHplAssets$,
      this.pullingHplCount$,
      this.pullingHplContacts$,
    ]).pipe(
      map(([a, b]) => a || b),
      distinctUntilChanged(),
    );
  }

  /**
   * Observable that triggers after documents where pushed to the DB.
   * @returns Array of Assets and Contacts objects just pushed
   * to the DB
   */
  subscribeOnPushing(): Observable<boolean> {
    return combineLatest([
      this.pushingAssets$,
      this.pushingContacts$,
      this.pushingAllowances$,
      this.pushingHplSubaccounts$,
      this.pushingHplVirtuals$,
      this.pushingHplAssets$,
      this.pushingHplCount$,
      this.pushingHplContacts$,
    ]).pipe(
      map(([a, b]) => a || b),
      distinctUntilChanged(),
    );
  }

  private _mapContactDoc(doc: RxDocument<ContactRxdbDocument>): Contact {
    return {
      name: doc.name,
      principal: doc.principal,
      accountIdentier: doc.accountIdentier,
      assets: doc.assets.map((a) => ({
        symbol: a.symbol,
        tokenSymbol: a.tokenSymbol,
        logo: a.logo,
        subaccounts: a.subaccounts.map((sa) => ({
          name: sa.name,
          subaccount_index: sa.subaccount_index,
          sub_account_id: sa.sub_account_id,
        })),
        address: a.address,
        decimal: a.decimal,
        shortDecimal: a.shortDecimal,
        supportedStandards: a.supportedStandards as typeof SupportedStandardEnum.options,
      })),
    };
  }

  private _mapAssetDoc(doc: RxDocument<AssetRxdbDocument>): Asset {
    return {
      name: doc.name,
      sortIndex: doc.sortIndex,
      address: doc.address,
      logo: doc.logo,
      decimal: doc.decimal,
      symbol: doc.symbol,
      index: doc.index,
      subAccounts: doc.subAccounts.map((sa) => ({
        numb: sa.sub_account_id,
        name: sa.name,
        amount: sa.amount,
        currency_amount: sa.currency_amount,
        address: sa.address,
        decimal: sa.decimal,
        sub_account_id: sa.sub_account_id,
        symbol: sa.symbol,
        transaction_fee: sa.transaction_fee,
      })),
      tokenName: doc.tokenName,
      tokenSymbol: doc.tokenSymbol,
      shortDecimal: doc.shortDecimal,
      supportedStandards: doc.supportedStandards as typeof SupportedStandardEnum.options,
    };
  }

  private _mapAllowanceDoc(doc: RxDocument<AllowanceRxdbDocument>): TAllowance {
    return {
      id: doc.id,
      subAccountId: doc.subAccountId,
      spender: doc.spender,
      asset: {
        logo: doc.asset.logo,
        name: doc.asset.name,
        symbol: doc.asset.symbol,
        address: doc.asset.address,
        decimal: doc.asset.decimal,
        tokenName: doc.asset.tokenName,
        tokenSymbol: doc.asset.tokenSymbol,
        supportedStandards: doc.asset.supportedStandards as typeof SupportedStandardEnum.options,
      },
    };
  }

  private _mapHplSubaccount(doc: RxDocument<HplSubAccountRxdbDocument>): HPLSubData {
    return {
      id: doc.id,
      name: doc.name,
      ftId: doc.ftId,
    };
  }

  private _mapHplVirtual(doc: RxDocument<HplVirtualRxdbDocument>): HPLVirtualData {
    return {
      id: doc.id,
      name: doc.name,
      ftId: doc.ftId,
      accesBy: doc.accesBy,
      isMint: doc.isMint,
    };
  }

  private _mapHplAsset(doc: RxDocument<HplAssetRxdbDocument>): HPLAssetData {
    return {
      id: doc.id,
      name: doc.name,
      symbol: doc.symbol,
      controller: doc.controller,
      decimals: doc.decimals,
      description: doc.description,
    };
  }

  private _mapHplCount(doc: RxDocument<HplCountRxdbDocument>): nHplData {
    return {
      nFtAssets: doc.nFtAssets,
      nVirtualAccounts: doc.nVirtualAccounts,
      nAccounts: doc.nAccounts,
    };
  }

  private _mapHplContact(doc: RxDocument<HplContactRxdbDocument>): HplContact {
    return {
      principal: doc.principal,
      name: doc.name,
      remotes: doc.remotes.map((cntc) => {
        return {
          name: cntc.name,
          index: cntc.index,
          status: cntc.status,
          expired: Number(cntc.expired),
          amount: cntc.amount,
          ftIndex: cntc.ftIndex,
          code: cntc.code,
        };
      }),
    };
  }

  private _invalidateDb(): void {
    if (this.assetsPullInterval !== undefined) {
      clearInterval(this.assetsPullInterval);
      this.assetsPullInterval = undefined;
    }
    if (this.contactsPullInterval !== undefined) {
      clearInterval(this.contactsPullInterval);
      this.contactsPullInterval = undefined;
    }
    if (this.allowancesPullInterval !== undefined) {
      clearInterval(this.allowancesPullInterval);
      this.allowancesPullInterval = undefined;
    }
    if (this.hplSubaccountsPullInterval !== undefined) {
      clearInterval(this.hplSubaccountsPullInterval);
      this.hplSubaccountsPullInterval = undefined;
    }
    if (this.hplVirtualsPullInterval !== undefined) {
      clearInterval(this.hplVirtualsPullInterval);
      this.hplVirtualsPullInterval = undefined;
    }
    if (this.hplAssetsPullInterval !== undefined) {
      clearInterval(this.hplAssetsPullInterval);
      this.hplAssetsPullInterval = undefined;
    }
    if (this.hplCountPullInterval !== undefined) {
      clearInterval(this.hplCountPullInterval);
      this.hplCountPullInterval = undefined;
    }
    if (this.hplContactsPullInterval !== undefined) {
      clearInterval(this.hplContactsPullInterval);
      this.hplContactsPullInterval = undefined;
    }
    //
    if (this.assetsReplicationState) {
      this.assetsReplicationState.cancel().then();
      this.assetsReplicationState = undefined;
    }
    if (this.contactsReplicationState) {
      this.contactsReplicationState.cancel().then();
      this.contactsReplicationState = undefined;
    }
    if (this.allowancesReplicationState) {
      this.allowancesReplicationState.cancel().then();
      this.allowancesReplicationState = undefined;
    }
    if (this.hplSubaccountsReplicationState) {
      this.hplSubaccountsReplicationState.cancel().then();
      this.hplSubaccountsReplicationState = undefined;
    }
    if (this.hplVirtualsReplicationState) {
      this.hplVirtualsReplicationState.cancel().then();
      this.hplVirtualsReplicationState = undefined;
    }
    if (this.hplAssetsReplicationState) {
      this.hplAssetsReplicationState.cancel().then();
      this.hplAssetsReplicationState = undefined;
    }
    if (this.hplCountReplicationState) {
      this.hplCountReplicationState.cancel().then();
      this.hplCountReplicationState = undefined;
    }
    if (this.hplContactsReplicationState) {
      this.hplContactsReplicationState.cancel().then();
      this.hplContactsReplicationState = undefined;
    }
    this._assets = null!;
    this._contacts = null!;
    this._allowances = null!;
    this._hplsubaccounts = null!;
    this._hplvirtuals = null!;
    this._hplassets = null!;
    this._hplcount = null!;
    this._hplcontacts = null!;
  }

  private async _assetsPushHandler(items: any[]): Promise<AssetRxdbDocument[]> {
    const arg = items.map(
      (x) =>
        ({
          ...x,
          sortIndex: x.sortIndex,
          updatedAt: Math.floor(Date.now() / 1000),
          logo: extractValueFromArray(x.logo),
          index: extractValueFromArray(x.index),
        } as AssetRxdbDocument),
    );

    await this.replicaCanister?.pushAssets(arg);

    return arg;
  }

  private async _assetsPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<AssetRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullAssets(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as AssetRxdbDocument[];

    return raw.map((x) => ({
      ...x,
      sortIndex: Number(x.sortIndex),
    }));
  }

  private async _contactsPushHandler(items: any): Promise<ContactRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      accountIdentier: extractValueFromArray(x.accountIdentier),
      assets: x.assets.map((a: any) => ({
        ...a,
        logo: extractValueFromArray(a.logo),
        subaccounts: a.subaccounts.map((s: any) => ({
          ...s,
          allowance:
            !!s.allowance && !!s.allowance.allowance
              ? [
                  {
                    allowance: [s.allowance.allowance],
                    expires_at: [s.allowance.expires_at],
                  },
                ]
              : [],
        })),
      })),
    }));

    await this.replicaCanister?.pushContacts(arg);

    return arg;
  }

  private async _contactsPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<ContactRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullContacts(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as ContactRxdbDocument[];

    return raw;
  }

  private async _allowancesPushHandler(items: any): Promise<AllowanceRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      expiration: extractValueFromArray(x.expiration),
      asset: {
        ...x.asset,
        logo: extractValueFromArray(x.asset?.logo),
      },
    }));

    await this.replicaCanister?.pushAllowances(arg);

    return arg;
  }

  private async _allowancesPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<AllowanceRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullAllowances(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as AllowanceRxdbDocument[];

    return raw;
  }

  private async _hplSubaccountsPushHandler(items: any): Promise<HplSubAccountRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      ledger: this.hplLedger,
    }));

    await this.replicaCanister?.pushHplSubaccounts(arg);

    return arg;
  }

  private async _hplSubaccountsPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<HplSubAccountRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullHplSubaccounts(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as HplSubAccountRxdbDocument[];

    return raw;
  }

  private async _hplVirtualsPushHandler(items: any): Promise<HplVirtualRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      ledger: this.hplLedger,
    }));

    await this.replicaCanister?.pushHplVirtuals(arg);

    return arg;
  }

  private async _hplVirtualsPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<HplVirtualRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullHplVirtuals(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as HplVirtualRxdbDocument[];

    return raw;
  }

  private async _hplAssetsPushHandler(items: any): Promise<HplAssetRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      ledger: this.hplLedger,
    }));

    await this.replicaCanister?.pushHplAssets(arg);

    return arg;
  }

  private async _hplAssetsPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<HplAssetRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullHplAssets(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as HplAssetRxdbDocument[];

    return raw;
  }

  private async _hplCountPushHandler(items: any): Promise<HplCountRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      ledger: this.hplLedger,
    }));

    await this.replicaCanister?.pushHplCount(arg);

    return arg;
  }

  private async _hplCountPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<HplCountRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullHplCount(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as HplCountRxdbDocument[];

    return raw;
  }

  private async _hplContactsPushHandler(items: any): Promise<HplContactRxdbDocument[]> {
    const arg = items.map((x: any) => ({
      ...x,
      updatedAt: Math.floor(Date.now() / 1000),
      ledger: this.hplLedger,
    }));

    await this.replicaCanister?.pushHplContacts(arg);

    return arg;
  }

  private async _hplContactsPullHandler(
    minTimestamp: number,
    lastId: string | null,
    batchSize: number,
  ): Promise<HplContactRxdbDocument[]> {
    const raw = (await this.replicaCanister?.pullHplContacts(
      minTimestamp,
      lastId ? [lastId] : [],
      BigInt(batchSize),
    )) as HplContactRxdbDocument[];

    return raw;
  }

  private async _doesRecordByPrincipalExist() {
    // Look for entry record by current principal ID
    const exist: boolean = await this.replicaCanister?.doesStorageExist();

    // If does not exist it means that this is a brand new account
    if (!exist) {
      try {
        await (
          await this.assets
        )?.bulkInsert(
          defaultTokens.map((dT) => ({
            ...dT,
            index: extractValueFromArray(dT.index),
            logo: extractValueFromArray(dT.logo),
            deleted: false,
            updatedAt: Date.now(),
          })),
        );
      } catch (e) {
        logger.debug("RxDb DoesDBExist:", e);
      }
    }
  }
}
