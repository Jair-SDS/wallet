import { ContactAccount, Contact } from "@/@types/contacts";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DeleteContactAccountModal from "./DeleteContactAccountModal";

interface ComponentProps {
  contact: Contact;
  account: ContactAccount;
}

export default function ContactAccountAction(props: ComponentProps) {
  return (
    <div className="grid w-full place-content-center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <DotsHorizontalIcon
            className="w-5 h-5 mr-[1.5rem] opacity-50 stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
            onClick={console.log}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="flex flex-col bg-red-200 rounded-md">
            <DeleteContactAccountModal contact={props.contact} account={props.account} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
