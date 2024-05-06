// svgs
import { ReactComponent as MoreIcon } from "@assets/svg/files/more-alt.svg";
import { ReactComponent as PencilIcon } from "@assets/svg/files/pencil.svg";
import { ReactComponent as ResetIcon } from "@assets/svg/files/refund-2-fill.svg";
import { ReactComponent as MintIcon } from "@assets/svg/files/mint-icon.svg";
import { ReactComponent as TrashIcon } from "@assets/svg/files/trash-icon.svg";
import { ReactComponent as SortIcon } from "@assets/svg/files/sort.svg";
//
import { getDecimalAmount, shortAddress } from "@/utils";
import { useHPL } from "@pages/hooks/hplHook";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FC, Fragment, useEffect, useState } from "react";
import { HPLVirtualSubAcc } from "@redux/models/AccountModels";
import { BasicModal } from "@components/modal";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { DrawerOption, DrawerOptionEnum } from "@/const";
import AssetSymbol from "@components/AssetSymbol";
import { CustomCopy } from "@components/tooltip";
import DeleteVirtualModal from "./Modals/deleteVirtual";
import ResetVirtualModal from "./Modals/resetVirtual";
import { _SERVICE as HplMintActor } from "@candid/HplMint/service.did";
import { idlFactory as HplMintIDLFactory } from "@candid/HplMint/candid.did";
import { AccountHook } from "@pages/hooks/accountHook";
import { Actor } from "@dfinity/agent";

interface VirtualTableProps {
  setDrawerOpen(value: boolean): void;
  setDrawerOption(value: DrawerOption): void;
  setSelectedVirtualAccount(value: string | null): void;
  selectedVirtualAccount: string | null;
  fullLinks?: boolean;
}

const VirtualTable: FC<VirtualTableProps> = ({
  setDrawerOpen,
  selectedVirtualAccount,
  setSelectedVirtualAccount,
  setDrawerOption,
  fullLinks,
}) => {
  const { t } = useTranslation();
  const { userAgent } = AccountHook();
  const { selectSub, sortVt, setSortVt, getFtFromSub, setSelVt, selectVt, hplContacts, getFtFromVt, exchangeLinks } =
    useHPL(false);

  const [openMore, setOpenMore] = useState(-1);
  const [errMsg, setErrMsg] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrMsg("");
    setLoading(false);
  }, [deleteModal]);

  return (
    <Fragment>
      <table className="w-full text-PrimaryTextColorLight/60 dark:text-PrimaryTextColor/60 text-md">
        <thead className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SecondaryColorLight dark:bg-SecondaryColor sticky top-0 z-[1]">
          <tr>
            <th className="p-2 w-[14%] font-normal">
              <div
                onClick={() => {
                  onSort("ID");
                }}
                className="flex flex-row items-center justify-center w-full gap-2 cursor-pointer"
              >
                <p>{t("code")}</p>
                <SortIcon className=" fill-PrimaryTextColorLight/70 dark:fill-PrimaryTextColor/70" />
              </div>
            </th>
            <th className="p-2 text-left w-[28%] font-normal">
              <p>{`${t("name")} (${selectSub?.virtuals.length || 0})`}</p>
            </th>
            <th className="p-2 w-[17%] font-normal">
              <p>{t("balance")}</p>
            </th>
            <th className="p-2 w-[13%] font-normal">
              <div
                onClick={() => {
                  onSort("EXPIRATION");
                }}
                className="flex flex-row items-center justify-center w-full gap-2 cursor-pointer"
              >
                <p>{t("expiration")}</p>
                <SortIcon className=" fill-PrimaryTextColorLight/70 dark:fill-PrimaryTextColor/70" />
              </div>
            </th>
            <th className="p-2 w-[20%] font-normal">
              <p>{t("access.by")}</p>
            </th>
            <th className="p-2 w-[8%] font-normal">
              <p>{t("action")}</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {getVirtualsSorted().map((vt, k) => {
            return (
              <tr
                className={getVirtualAccountClassNames(vt.virt_sub_acc_id === selectedVirtualAccount)}
                key={k}
                onClick={handleVirtualAccountClick(vt.virt_sub_acc_id)}
              >
                <td className={`${rowStyle(vt.expiration)}`}>
                  <div className="flex flex-row items-center justify-center gap-1">
                    <p className="ml-[-0.4rem]">{vt.code}</p>{" "}
                    <CustomCopy size={"xSmall"} copyText={vt.code} className="opacity-60" />{" "}
                  </div>
                </td>
                <td
                  className={`${rowStyle(
                    vt.expiration,
                  )} text-left text-PrimaryTextColorLight dark:text-PrimaryTextColor px-2`}
                >
                  {vt.name}
                </td>
                <td className={`${rowStyle(vt.expiration)}`}>
                  <div className="flex flex-row justify-center w-full">
                    {" "}
                    <AssetSymbol
                      ft={getFtFromSub(selectSub?.ft || "0")}
                      sufix={<p>{`${getDecimalAmount(vt.amount, getFtFromSub(selectSub?.ft || "0").decimal)}`}</p>}
                    />
                  </div>
                </td>
                <td className={`${rowStyle(vt.expiration)}`}>{getExpiration(vt.expiration)}</td>
                <td className={`${rowStyle(vt.expiration)}`}>{getAccesByContactName(vt.accesBy)}</td>
                <td className="py-2">
                  <div className="relative flex items-center justify-center h-full">
                    <DropdownMenu.Root
                      open={openMore === k}
                      onOpenChange={(e) => {
                        onOpenMoreChange(k, e);
                      }}
                    >
                      <DropdownMenu.Trigger>
                        <MoreIcon className="cursor-pointer fill-PrimaryTextColorLight/70 dark:fill-PrimaryTextColor/70" />
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className=" w-[8rem] bg-PrimaryColorLight rounded-md dark:bg-SecondaryColor !z-[999] text-PrimaryTextColorLight dark:text-PrimaryTextColor dark:border dark:border-BorderColorTwo shadow-md shadow-PrimaryColor/30 dark:shadow-black/20"
                          sideOffset={5}
                          align="end"
                        >
                          <div
                            className="flex flex-row items-center justify-start gap-2 p-2 cursor-pointer opacity-70 hover:bg-HoverColorLight dark:hover:bg-HoverColor rounded-t-md"
                            onClick={() => {
                              onEdit(vt);
                            }}
                          >
                            <PencilIcon className="w-4 h-4 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor" />
                            <p>{t("edit")}</p>
                          </div>
                          {vt.isMint && (
                            <div
                              className="flex flex-row items-center justify-start gap-2 p-2 cursor-pointer opacity-70 hover:bg-HoverColorLight dark:hover:bg-HoverColor rounded-t-md"
                              onClick={() => {
                                onMint(vt);
                              }}
                            >
                              <MintIcon className="w-4 h-4 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor" />
                              <p>{t("mint")}</p>
                            </div>
                          )}
                          <div
                            className="flex flex-row items-center justify-start gap-2 p-2 cursor-pointer opacity-70 hover:bg-HoverColorLight dark:hover:bg-HoverColor rounded-t-md"
                            onClick={() => {
                              onReset(vt);
                            }}
                          >
                            <ResetIcon className="w-4 h-4 cursor-pointer fill-PrimaryTextColorLight dark:fill-PrimaryTextColor" />
                            <p>{t("reset")}</p>
                          </div>
                          <div
                            className="flex flex-row items-center justify-start gap-2 p-2 cursor-pointer hover:bg-TextErrorColor/10 rounded-b-md"
                            onClick={() => {
                              onDelete(vt);
                            }}
                          >
                            <TrashIcon className="w-4 h-4 cursor-pointer fill-TextErrorColor" />
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
      <BasicModal
        open={deleteModal || resetModal}
        width="w-[22rem]"
        padding="p-5"
        border="border border-BorderColorTwoLight dark:border-BorderColorTwo"
      >
        {deleteModal ? (
          <DeleteVirtualModal
            selectVt={selectVt}
            loading={loading}
            errMsg={errMsg}
            setSelVt={setSelVt}
            setLoading={setLoading}
            setDeleteModal={setDeleteModal}
            setErrMsg={setErrMsg}
          />
        ) : resetModal ? (
          <ResetVirtualModal
            selectVt={selectVt}
            loading={loading}
            errMsg={errMsg}
            setSelVt={setSelVt}
            setLoading={setLoading}
            setResetModal={setResetModal}
            setErrMsg={setErrMsg}
          />
        ) : (
          <div></div>
        )}
      </BasicModal>
    </Fragment>
  );

  function handleVirtualAccountClick(vId: string) {
    return () => {
      if (selectedVirtualAccount === vId) {
        setSelectedVirtualAccount(null);
      } else {
        setSelectedVirtualAccount(vId);
      }
    };
  }

  function getVirtualAccountClassNames(isSelected: boolean) {
    const defaultClassNames =
      "border-b border-BorderColorTwoLight dark:border-BorderColorTwo cursor-pointer hover:bg-SelectRowColor/20 focus:bg-SelectRowColor/20 cursor";
    if (isSelected) {
      const selectedClassNames =
        "relative after:absolute after:w-[4px] after:h-full after:left-0 after:bg-[#33B2EF] bg-SelectRowColor/20";
      return [defaultClassNames, selectedClassNames].join(" ");
    }
    return defaultClassNames;
  }

  function getAccesByContactName(principal: string) {
    const contact = hplContacts.find((cntc) => cntc.principal === principal);
    return contact ? contact.name : shortAddress(principal, 6, 4);
  }

  function getVirtualsSorted() {
    let virtualsToShow: HPLVirtualSubAcc[] = [];

    if (fullLinks) {
      virtualsToShow = exchangeLinks;
    } else if (selectSub) {
      virtualsToShow = [...selectSub.virtuals];
    } else {
      return [];
    }

    if (selectSub) {
      switch (sortVt.value) {
        case 1:
          return [...virtualsToShow].sort((a, b) => {
            if (sortVt.col === "ID") {
              return 1;
            } else {
              const aNumber = a.expiration === 0 ? 999999999999999 : a.expiration;
              const bNumber = b.expiration === 0 ? 999999999999999 : b.expiration;
              return aNumber - bNumber;
            }
          });
        case -1:
          return [...virtualsToShow].sort((a, b) => {
            if (sortVt.col === "ID") {
              return Number(b.virt_sub_acc_id) - Number(a.virt_sub_acc_id);
            } else {
              const aNumber = a.expiration === 0 ? 999999999999999 : a.expiration;
              const bNumber = b.expiration === 0 ? 999999999999999 : b.expiration;
              return bNumber - aNumber;
            }
          });
        default:
          return virtualsToShow;
      }
    } else return [];
  }
  function getExpiration(exp: number) {
    if (exp === 0) return t("no.expiration");
    else {
      return dayjs(exp).format("MM/DD/YYYY hh:mm");
    }
  }
  function onSort(sType: string) {
    if (sortVt.col !== sType) setSortVt({ value: 1, col: sType });
    else setSortVt({ value: sortVt.value === 1 ? -1 : 1, col: sortVt.col });
  }
  function onOpenMoreChange(k: number, e: boolean) {
    setOpenMore(e ? k : -1);
  }

  function onEdit(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setDrawerOpen(true);
    setDrawerOption(DrawerOptionEnum.Enum.EDIT_VIRTUAL);
    setOpenMore(-1);
  }

  async function onMint(vt: HPLVirtualSubAcc) {
    const mintActor = Actor.createActor<HplMintActor>(HplMintIDLFactory, {
      agent: userAgent,
      canisterId: vt.accesBy,
    });
    try {
      const res = (await mintActor.notifyAndMint(
        BigInt(getFtFromVt(vt.backing).id),
        BigInt(vt.virt_sub_acc_id),
      )) as any;
      if (res.err) {
        console.error(res.err);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function onReset(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setOpenMore(-1);
    setResetModal(true);
  }

  function onDelete(vt: HPLVirtualSubAcc) {
    setSelVt(vt);
    setOpenMore(-1);
    setDeleteModal(true);
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
