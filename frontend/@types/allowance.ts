import { AssetSchema } from "@redux/models/AccountModels";
import { z } from "zod";

const subAccount = z.object({
  name: z.string(),
  sub_account_id: z.string(),
  address: z.string(),
  amount: z.string(),
  currency_amount: z.string(),
  transaction_fee: z.string(),
  decimal: z.number(),
  symbol: z.string(),
});

export const allowanceSchema = z.object({
  // TODO: remove id
  // id: z.string().optional(),
  // TODO: from assets remove sub accounts
  asset: AssetSchema,
  subAccount,
  amount: z.string(),
  spender: z.object({
    principal: z.string(),
    name: z.string().optional(),
  }),
  expiration: z.string().optional(),
});

export type TAllowance = z.infer<typeof allowanceSchema>;

export const AllowancesTableColumnsEnum = z.enum(["subAccount", "spender", "amount", "expiration", "action"]);
export type AllowancesTableColumns = z.infer<typeof AllowancesTableColumnsEnum>;

export const AllowanceErrorFieldsEnum = z.enum(["spender", "asset", "amount", "expiration", "subAccount"]);
export type AllowanceErrorFields = z.infer<typeof AllowanceErrorFieldsEnum>;

export const AllowanceValidationErrorsEnum = z.enum([
  "error.invalid.asset",
  "error.invalid.spender.principal",
  "error.invalid.expiration",
  "error.expiration.required",
  "error.expiration.not.allowed",
  "error.before.present.expiration",
  "error.not.enough.balance",
  "error.invalid.amount",
  "error.allowance.duplicated",
  "warn.system.loading",
  "error.invalid.subaccount",
  "error.self.allowance",
]);
export type AllowanceValidationErrors = z.infer<typeof AllowanceValidationErrorsEnum>;
