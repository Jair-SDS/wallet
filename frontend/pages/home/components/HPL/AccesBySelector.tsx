// svgs
import { shortAddress } from "@/utils";
import ChevIcon from "@assets/svg/files/chev-icon.svg";
import SearchIcon from "@assets/svg/files/icon-search.svg";
//
import { CustomInput } from "@components/Input";
import { useHPL } from "@pages/hooks/hplHook";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HPLVirtualSubAcc, HplContact } from "@redux/models/AccountModels";
import { ChangeEvent, useState } from "react";

interface AccesBySelectorProps {
  newVt: HPLVirtualSubAcc;
  setNewVt(value: HPLVirtualSubAcc): void;
  onAccesChange(e: ChangeEvent<HTMLInputElement>): void;
  accesErr: boolean;
  setAccesErr(value: boolean): void;
}

const AccesBySelector = ({ newVt, setNewVt, onAccesChange, accesErr, setAccesErr }: AccesBySelectorProps) => {
  const { hplContacts } = useHPL(false);

  const [searchKey, setSearchKey] = useState("");
  const [remotesOpen, setRemotesOpen] = useState(false);

  return (
    <CustomInput
      sizeInput={"small"}
      intent={"secondary"}
      compOutClass=""
      value={newVt.accesBy}
      onChange={onAccesChange}
      border={accesErr ? "error" : undefined}
      sufix={
        <DropdownMenu.Root
          open={remotesOpen}
          onOpenChange={(e: boolean) => {
            setRemotesOpen(e);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <img
              src={ChevIcon}
              style={{ width: "2rem", height: "2rem" }}
              alt="chevron-icon"
              className={`cursor-pointer ${remotesOpen ? "rotate-90" : ""}`}
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="text-lg bg-PrimaryColorLight w-[25rem] rounded-lg dark:bg-SecondaryColor z-[2000] text-PrimaryTextColorLight dark:text-PrimaryTextColor shadow-sm shadow-BorderColorTwoLight dark:shadow-BorderColorTwo border border-SelectRowColor"
              sideOffset={5}
              alignOffset={-5}
              align="end"
            >
              <div className="flex flex-col justify-start items-start w-full p-1 gap-2">
                <CustomInput
                  prefix={<img src={SearchIcon} className="mx-2" alt="search-icon" />}
                  sizeInput={"small"}
                  intent={"secondary"}
                  placeholder=""
                  compOutClass=""
                  value={searchKey}
                  onChange={onSearchChange}
                />
                <div className="flex flex-col justify-start items-start w-full scroll-y-light max-h-[calc(100vh-30rem)]">
                  {hplContacts
                    .filter((cntc) => {
                      return (
                        cntc.name.toLowerCase().includes(searchKey.toLowerCase()) ||
                        cntc.principal.toLowerCase().includes(searchKey.toLowerCase())
                      );
                    })
                    .map((cntc, k) => {
                      return (
                        <div
                          key={k}
                          className="p-1 flex flex-row justify-start items-center w-full cursor-pointer gap-2 text-sm hover:bg-HoverColorLight dark:hover:bg-HoverColor"
                          onClick={() => {
                            onSelectBacking(cntc);
                          }}
                        >
                          <p className=" text-PrimaryTextColor">{`${cntc.name} - [${shortAddress(
                            cntc.principal,
                            12,
                            10,
                          )}]`}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      }
    />
  );
  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchKey(e.target.value);
  }
  function onSelectBacking(cntc: HplContact) {
    setNewVt({ ...newVt, accesBy: cntc.principal });
    setRemotesOpen(false);
    setAccesErr(false);
  }
};

export default AccesBySelector;
