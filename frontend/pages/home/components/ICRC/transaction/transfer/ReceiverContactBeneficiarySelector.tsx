import { BasicSelect } from "@components/select";
import { useState } from "react";
import { AvatarEmpty } from "@components/avatar";
import { SelectOption } from "@/@types/components";
import { useAppSelector } from "@redux/Store";
import { useTransfer } from "@pages/home/contexts/TransferProvider";
import { Contact } from "@redux/models/ContactsModels";
import { useTranslation } from "react-i18next";

interface ReceiverContactBeneficiarySelectorProps {
  selectedContact?: Contact;
  setSelectedContact(value: Contact | undefined): void;
  setBeneficiary(value: string): void;
  fromAllowances?: boolean;
  onSelectOption(option: SelectOption): void;
}

export default function ReceiverContactBeneficiarySelector(props: ReceiverContactBeneficiarySelectorProps) {
  const { selectedContact, setSelectedContact, setBeneficiary, fromAllowances, onSelectOption } = props;
  const { t } = useTranslation();
  const { setTransferState } = useTransfer();
  const [searchSubAccountValue, setSearchSubAccountValue] = useState<string | null>(null);
  const { contacts } = useAppSelector((state) => state.contacts);

  const formattedContacts = (() => {
    if (!searchSubAccountValue) return contacts.map(formatContact);
    return contacts
      .filter((contact) => {
        return (
          (!selectedContact || selectedContact.principal !== contact.principal) &&
          (contact.name.toLocaleLowerCase().includes(searchSubAccountValue.trim()) || searchSubAccountValue === "")
        );
      })
      .map(formatContact);
  })();

  return (
    <div className="relative w-full">
      <BasicSelect
        onSelect={onSelect}
        options={formattedContacts}
        initialValue={`${selectedContact?.principal}`}
        currentValue={`${selectedContact?.principal}`}
        onSearch={onSearchChange}
        onOpenChange={onOpenChange}
        componentWidth={fromAllowances ? "22rem" : "21rem"}
        margin="!mt-0"
      />
      <button
        className={`absolute ${fromAllowances ? "right-6 top-1" : "-right-4 -bottom-[2.75rem]"}`}
        onClick={onClear}
      >
        <p className="text-md text-slate-color-info underline">{t("clear")}</p>
      </button>
    </div>
  );

  function formatContact(contact: Contact) {
    return {
      value: `${contact.principal}`,
      label: `${contact.name}`,
      icon: <AvatarEmpty title={contact.name} background={"info"} size="medium" className="mr-4" />,
    };
  }

  function onSelect(option: SelectOption) {
    setSearchSubAccountValue(null);
    onSelectOption(option);
  }

  function onSearchChange(searchValue: string) {
    setSearchSubAccountValue(searchValue);
  }

  function onOpenChange() {
    setSearchSubAccountValue(null);
  }

  function onClear() {
    setTransferState((prev) => ({
      ...prev,
      toSubAccount: "err",
    }));
    setSelectedContact(undefined);
    setBeneficiary("");
  }
}
