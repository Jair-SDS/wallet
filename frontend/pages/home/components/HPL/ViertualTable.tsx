// svgs
import { ReactComponent as MoreIcon } from "@assets/svg/files/more-alt.svg";
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as WarningIcon } from "@assets/svg/files/warning.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { shortAddress } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Fragment, useEffect, useState } from "react";
import { HPLVirtualSubAcc } from "@redux/models/AccountModels";
import Modal from "@components/Modal";
import { CustomButton } from "@components/Button";
import { AccountHook } from "@pages/hooks/accountHook";
import { clsx } from "clsx";
import dayjs from "dayjs";

interface VirtualTableProps {
  setDrawerOpen(value: boolean): void;
}

const VirtualTable = ({ setDrawerOpen }: VirtualTableProps) => {
  const { t } = useTranslation();
  const { authClient } = AccountHook();
  const { ingressActor, selectSub, sortVt, getFtFromSub, setSelVt, selectVt, hplVTsData, reloadHPLBallance } =
    useHPL(false);
  const [openMore, setOpenMore] = useState(-1);
  const [errMsg, setErrMsg] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    setErrMsg("");
  }, [deleteModal]);

  return (
    <Fragment>
      <table className="w-full text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60 text-md">
        <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SecondaryColorLight dark:bg-SecondaryColor sticky top-0 z-[1]">
          <tr>
            <th className="p-2 w-[10%]font-normal">
              <p>{"ID"}</p>
            </th>
            <th className="p-2 text-left w-[30%] font-normal">
              <p>{`${t("name")} (${selectSub?.virtuals.length || 0})`}</p>
            </th>
            <th className="p-2 w-[17%] font-normal">
              <p>{t("balance")}</p>
            </th>
            <th className="p-2 w-[13%] font-normal">
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
                <td className={`${rowStyle(vt.expiration)}`}>{vt.virt_sub_acc_id}</td>
                <td
                  className={`${rowStyle(
                    vt.expiration,
                  )} text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor px-2`}
                >
                  {vt.name}
                </td>
                <td className={`${rowStyle(vt.expiration)}`}>{`${vt.amount} ${
                  selectSub ? getFtFromSub(selectSub.ft).symbol : ""
                }`}</td>
                <td className={`${rowStyle(vt.expiration)}`}>{getExpiration(vt.expiration)}</td>
                <td className={`${rowStyle(vt.expiration)}`}>{shortAddress(vt.accesBy, 6, 4)}</td>
                <td className="py-2">
                  <div className="relative flex justify-center items-center h-full">
                    <DropdownMenu.Root
                      open={openMore === k}
                      onOpenChange={(e) => {
                        onOpenMoreChange(k, e);
                      }}
                    >
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
      <Modal
        open={deleteModal}
        width="w-[22rem]"
        padding="p-5"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
      >
        <div className="flex flex-col justify-start items-start w-full gap-4 text-md">
          <div className="flex flex-row justify-between items-center w-full">
            <WarningIcon className="w-6 h-6" />
            <CloseIcon
              className="stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor cursor-pointer"
              onClick={() => {
                setDeleteModal(false);
              }}
            />
          </div>
          <p className=" text-justify w-full">
            {t("delete.virtual.1")}{" "}
            <span className="font-semibold">
              {selectVt?.name != "" ? selectVt?.name : `[ ${selectVt?.virt_sub_acc_id || "0"} ]`}?
            </span>{" "}
            {t("delete.virtual.2")}
          </p>
          <div className="w-full flex flex-row justify-between items-center gap-2">
            <p className="text-sm text-TextErrorColor">{errMsg}</p>
            <CustomButton className="min-w-[5rem]" onClick={onConfirmDelete} size={"small"}>
              <p>{t("yes")}</p>
            </CustomButton>
          </div>
        </div>
      </Modal>
    </Fragment>
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
      return dayjs(exp).format("MM/DD/YYYY hh:mm");
    }
  }
  function onOpenMoreChange(k: number, e: boolean) {
    setOpenMore(e ? k : -1);
  }
  function onEdit(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setDrawerOpen(true);
    setOpenMore(-1);
  }
  function onDelete(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setOpenMore(-1);
    setDeleteModal(true);
  }
  async function onConfirmDelete() {
    if (selectVt) {
      const res = (await ingressActor.deleteVirtualAccount(BigInt(selectVt.virt_sub_acc_id))) as any;
      if (res.err) {
        setErrMsg("err.back");
      } else {
        const auxVts = hplVTsData.filter((vt) => vt.id != selectVt.virt_sub_acc_id);
        localStorage.setItem(
          "hplVT-" + authClient,
          JSON.stringify({
            vt: auxVts,
          }),
        );
        reloadHPLBallance();
        setDeleteModal(false);
        setSelVt(undefined);
      }
    }
  }
  // Tailwind CSS
  function rowStyle(date: number) {
    return clsx({
      ["p-2"]: true,
      ["opacity-40"]: date !== 0 && dayjs(date).isBefore(dayjs()),
    });
  }
};

export default VirtualTable;
