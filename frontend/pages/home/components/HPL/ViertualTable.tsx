// svgs
import { ReactComponent as MoreIcon } from "@assets/svg/files/more-alt.svg";
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
//
import { shortAddress } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import { useTranslation } from "react-i18next";
import moment from "moment";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { HPLVirtualSubAcc } from "@redux/models/AccountModels";

interface VirtualTableProps {
  setDrawerOpen(value: boolean): void;
}

const VirtualTable = ({ setDrawerOpen }: VirtualTableProps) => {
  const { t } = useTranslation();
  const { selectSub, sortVt, getFtFromSub, setSelVt } = useHPL(false);
  const [openMore, setOpenMore] = useState(false);

  return (
    <table className="w-full text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60 text-md">
      <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SecondaryColorLight dark:bg-SecondaryColor sticky top-0 z-[1]">
        <tr>
          <th className="p-2 w-[10%]font-normal">
            <p>{"ID"}</p>
          </th>
          <th className="p-2 text-left w-[32%] font-normal">
            <p>{`${t("name")} (${selectSub?.virtuals.length || 0})`}</p>
          </th>
          <th className="p-2 w-[15%] font-normal">
            <p>{t("balance")}</p>
          </th>
          <th className="p-2 text-left w-[13%] font-normal">
            <p>{t("expiration")}</p>
          </th>
          <th className="p-2 w-[20%] font-normal">
            <p>{t("access.by")}</p>
          </th>
          <th className="p-2 w-[10%] font-normal">
            <p>{t("action")}</p>
          </th>
        </tr>
      </thead>
      <tbody>
        {getVirtualsSorted().map((vt, k) => {
          return (
            <tr
              className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo hover:bg-SelectRowColor/20"
              key={k}
            >
              <td className="py-2">{vt.virt_sub_acc_id}</td>
              <td className="px-2 text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor py-2">{vt.name}</td>
              <td className="py-2">{`${vt.amount} ${selectSub ? getFtFromSub(selectSub.ft).symbol : ""}`}</td>
              <td className="py-2">{getExpiration(vt.expiration)}</td>
              <td className="py-2">{shortAddress(vt.accesBy, 6, 4)}</td>
              <td className="py-2">
                <div className="relative flex justify-center items-center h-full">
                  <DropdownMenu.Root open={openMore} onOpenChange={onOpenMoreChange}>
                    <DropdownMenu.Trigger>
                      <MoreIcon className="cursor-pointer fill-PrimaryTextColorLight/70 dark:fill-PrimaryTextColor/70" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal className="w-full">
                      <DropdownMenu.Content
                        className=" w-[8rem] bg-PrimaryColorLight rounded-md dark:bg-SecondaryColor !z-[999] text-PrimaryTextColorLight dark:text-PrimaryTextColor dark:border dark:border-BorderColorTwo shadow-md shadow-PrimaryColor/30 dark:shadow-black/20"
                        sideOffset={5}
                        align="end"
                      >
                        <div
                          className="flex flex-row justify-start items-center gap-2 p-2 opacity-70 hover:bg-HoverColorLight dark:hover:bg-HoverColor rounded-t-md cursor-pointer"
                          onClick={() => {
                            onEdit(vt);
                          }}
                        >
                          <PencilIcon className="w-4 h-4 fill-PrimaryTextColorLight dark:fill-PrimaryTextColor cursor-pointer" />
                          <p>{t("edit")}</p>
                        </div>
                        <div
                          className="flex flex-row justify-start items-center gap-2 p-2 hover:bg-TextErrorColor/10 rounded-b-md cursor-pointer"
                          onClick={() => {
                            onDelete(vt);
                          }}
                        >
                          <TrashIcon className="w-4 h-4 fill-TextErrorColor cursor-pointer" />
                          <p className="text-TextErrorColor">{t("delete")}</p>
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
  function getVirtualsSorted() {
    if (selectSub) {
      switch (sortVt) {
        case 0:
          return selectSub.virtuals;
        case 1:
          return selectSub.virtuals.sort((a, b) => a.expiration - b.expiration);
        case -1:
          return selectSub.virtuals.sort((a, b) => b.expiration - a.expiration);
        default:
          return selectSub.virtuals;
      }
    } else return [];
  }
  function getExpiration(exp: number) {
    if (exp === 0) return t("no.expiration");
    else {
      return moment.unix(exp).format("MM/DD/YYYY, hh:mm");
    }
  }
  function onOpenMoreChange(e: boolean) {
    setOpenMore(e);
  }
  function onEdit(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setDrawerOpen(true);
    setOpenMore(false);
  }
  function onDelete(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setOpenMore(false);
  }
};

export default VirtualTable;
