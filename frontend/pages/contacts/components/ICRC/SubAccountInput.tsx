import { ContactAccount } from "@redux/models/ContactsModels";
import { CustomInput } from "@components/input";
import { asciiHex } from "@pages/contacts/constants/asciiHex";
import { Dispatch, forwardRef, SetStateAction } from "react";
import { getSubAccount, getSubAccountId } from "@pages/contacts/helpers/formatters";
import { ContactAccountError } from "./AddContactAccountRow";
import { validatePrincipal } from "@common/utils/definityIdentity";
import { useAppSelector } from "@redux/Store";
import { t } from "i18next";
import * as RadixSwitch from "@radix-ui/react-switch";
import clsx from "clsx";
import { isHexadecimalValid } from "@pages/home/helpers/checkers";

interface SubAccountInputProps {
  newAccount: ContactAccount | null;
  setNewAccount: Dispatch<SetStateAction<ContactAccount | null>>;
  isHexadecimal: boolean;
  setIsHexadecimal: Dispatch<SetStateAction<boolean>>;
  error: boolean;
  clearErrors: () => void;
  setErrors: Dispatch<SetStateAction<ContactAccountError>>;
}

function SubAccountInput(props: SubAccountInputProps, testRef: any) {
  const contacts = useAppSelector((state) => state.contacts.contacts);

  return (
    <div className="relative flex flex-row items-center w-full h-10 gap-1 pr-2">
      <CustomInput
        intent={"primary"}
        border={props.error ? "error" : "selected"}
        sizeComp={"xLarge"}
        sizeInput="small"
        value={props.newAccount?.subaccount}
        onChange={onSubAccountChange}
        onKeyDown={onKeyDownIndex}
        className="h-[2.2rem] dark:bg-level-2-color bg-white rounded-lg border-[2px]"
        inputClass="h-[1.5rem]"
        placeholder={props.isHexadecimal ? "Hexadecimal" : "Principal"}
        sufix={props.error && isSubaccountDuplicated(props.newAccount?.subaccountId || undefined) ? <p className="text-sm capitalize text-slate-color-error">{t("duplicate")}</p> : undefined}
      />

      <div className="flex items-center ml-1 mr-[1rem]">
        <RadixSwitch.Root
          id=""
          checked={props.isHexadecimal}
          onCheckedChange={() => {
            props.setIsHexadecimal((prev) => !prev);
            props.setErrors((prev) => ({
              ...prev,
              subaccountId: false,
            }));
            props.setNewAccount((prev) => {
              if (!prev)
                return {
                  name: "",
                  subaccount: "",
                  subaccountId: "",
                  tokenSymbol: "",
                  allowance: undefined,
                };

              return { ...prev, subaccountId: "", subaccount: "", allowance: undefined };
            });
          }}
          className="rounded-md bg-level-2-color min-h-[2rem] min-w-[7rem] relative"
        >
          <p className={clsx(
            "absolute  text-white top-2 text-sm transition-all duration-300",
            {
              "left-0 ml-2": !props.isHexadecimal,
              "right-0 mr-2": props.isHexadecimal,
            }
          )}>
            {!props.isHexadecimal ? "Hex" : "Principal"}
          </p>

          <RadixSwitch.Thumb className={clsx(
            "bg-primary-color absolute top-0 left-0 w-6/12 h-full rounded-md transition-all duration-300 flex items-center justify-center",
            { "translate-x-full": !props.isHexadecimal }
          )}>
            <p className="text-sm font-bold text-white">
              {props.isHexadecimal ? "Hex" : "Principal"}
            </p>
          </RadixSwitch.Thumb>

        </RadixSwitch.Root>
      </div>
    </div>
  );

  function isSubaccountDuplicated(subaccount: string | undefined) {
    if (!subaccount) return false;
    const subaccountId = subaccount.startsWith("0x") ? subaccount : `0x${subaccount}`;
    return contacts.some((contact) => contact.accounts.some((account) => account.subaccountId === subaccountId && account.tokenSymbol === props.newAccount?.tokenSymbol));
  };

  function onKeyDownIndex(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!props.isHexadecimal) {
      if (!asciiHex.includes(e.key)) {
        e.preventDefault();
      }
      if (props.newAccount?.subaccountId?.toLowerCase().startsWith("0x")) {
        if (e.key?.toLowerCase() === "x") {
          e.preventDefault();
        }
      }
    }
  }

  function onSubAccountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim().toLowerCase();
    testRef.current = false;

    props.setNewAccount((prev) => {
      if (prev)
        return {
          ...prev,
          subaccount: props.isHexadecimal ? getSubAccount(value) : value,
          subaccountId: props.isHexadecimal ? getSubAccountId(value) : value,
        };

      return {
        name: "",
        subaccount: "",
        subaccountId: "",
        tokenSymbol: "",
      };
    });

    if (props.isHexadecimal) {
      props.setErrors((prev) => ({
        ...prev,
        subaccountId: !isHexadecimalValid(value),
      }));
    } else {
      props.setErrors((prev) => ({
        ...prev,
        subaccountId: !validatePrincipal(value),
      }));
    }

  }
}

export default forwardRef(SubAccountInput);
