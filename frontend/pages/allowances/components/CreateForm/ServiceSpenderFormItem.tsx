import { AllowanceValidationErrorsEnum, TAllowance } from "@/@types/allowance";
import { SelectOption } from "@/@types/components";
import { validatePrincipal } from "@/common/utils/definityIdentity";
import { CustomInput } from "@components/input";
import { Buffer } from "buffer";
import { BasicSelect } from "@components/select";
import { useAppSelector } from "@redux/Store";
import { removeAllowanceErrorAction } from "@redux/allowance/AllowanceActions";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AvatarEmpty } from "@components/avatar";
import { Service } from "@redux/models/ServiceModels";
import { Contact } from "@redux/models/ContactsModels";
import ReceiverContactBeneficiarySelector from "@pages/home/components/ICRC/transaction/transfer/ReceiverContactBeneficiarySelector";
import BeneficiaryContactBook from "@pages/home/components/ICRC/transaction/transfer/BeneficiaryContactBook";
import { Principal } from "@dfinity/principal";

interface IServiceSpenderFormItemProps {
  setAllowanceState: (allowanceData: Partial<TAllowance>) => void;
  isLoading?: boolean;
  allowance: TAllowance;
}

export default function ServiceSpenderFormItem(props: IServiceSpenderFormItemProps) {
  const { t } = useTranslation();
  const [isPrincipalValid, setIsPrincipalValid] = useState(true);
  const { authClient } = useAppSelector((state) => state.auth);
  const { errors } = useAppSelector((state) => state.allowance);
  const { services } = useAppSelector((state) => state.services);
  const [search, setSearch] = useState<string | null>(null);
  const [contactBeneficiary, setContactBeneficiary] = useState<Contact>();
  const [beneficiary, setBeneficiary] = useState(authClient);

  const onSearchChange = (searchValue: string) => setSearch(searchValue);
  const onOpenChange = () => setSearch(null);

  const { setAllowanceState, isLoading, allowance } = props;

  const options = useMemo(() => {
    if (!search) return services?.map(formatService);

    return services?.filter((srv) => srv.name.toLowerCase().includes(search?.toLowerCase() || "")).map(formatService);
  }, [search, services]);

  return (
    <div className="mx-auto mt-4 w-[22rem]">
      <p className="text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor">{t("service")}</p>
      <BasicSelect
        onSelect={onSelectedChange}
        options={options}
        disabled={isLoading}
        initialValue={allowance?.spender || ""}
        currentValue={allowance?.spender || ""}
        border={getError() ? "error" : undefined}
        onSearch={onSearchChange}
        onOpenChange={onOpenChange}
        componentWidth="22rem"
      />

      <p className="text-md text-PrimaryTextColorLight dark:text-PrimaryTextColor mt-2">{t("beneficiary")}</p>
      {contactBeneficiary ? (
        <ReceiverContactBeneficiarySelector
          setBeneficiary={setBeneficiary}
          selectedContact={contactBeneficiary}
          setSelectedContact={setContactBeneficiary}
          fromAllowances
        />
      ) : (
        <CustomInput
          intent="primary"
          value={beneficiary}
          sufix={
            <div className="flex flex-row justify-between items-center gap-1 pl-1">
              <div className="p-0 cursor-pointer" onClick={onSelf}>
                <p className="text-sm text-slate-color-info underline">{t("self")}</p>
              </div>
              <BeneficiaryContactBook setSelectedContact={setContactBeneficiary} fromAllowances />
            </div>
          }
          border={!isPrincipalValid ? "error" : "primary"}
          sizeInput={"small"}
          onChange={onInputChange}
          autoFocus
        />
      )}
    </div>
  );

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newSearchValue = event.target.value.trim();
    setBeneficiary(newSearchValue);

    if (!validatePrincipal(newSearchValue)) {
      setIsPrincipalValid(false);
      setAllowanceState({ spenderSubaccount: "err" });
    } else {
      setIsPrincipalValid(true);
      removeAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.invalid.spender.beneficiary"]);
      const princBytes = Principal.fromText(newSearchValue).toUint8Array();
      const princSubId = `0x${princBytes.length.toString(16) + Buffer.from(princBytes).toString("hex")}`;
      setAllowanceState({ spenderSubaccount: princSubId });
    }
  }

  function onSelectedChange(option: SelectOption) {
    setSearch(null);
    const fullSpender = services.find((srv) => srv.principal === option.value);
    setAllowanceState({ spender: fullSpender?.principal || "" });

    removeAllowanceErrorAction(AllowanceValidationErrorsEnum.Values["error.invalid.spender.principal"]);
  }

  function getError(): boolean {
    return errors?.includes(AllowanceValidationErrorsEnum.Values["error.invalid.spender.principal"]) || false;
  }
  function formatService(srv: Service) {
    return {
      value: srv.principal,
      label: `${srv.name}`,
      icon: <AvatarEmpty title={srv.name} size="medium" className="mr-4" />,
    };
  }
  function onSelf() {
    setIsPrincipalValid(true);
    setBeneficiary(authClient);
    const princBytes = Principal.fromText(authClient).toUint8Array();
    const princSubId = `0x${princBytes.length.toString(16) + Buffer.from(princBytes).toString("hex")}`;
    setAllowanceState({ spenderSubaccount: princSubId });
  }
}
