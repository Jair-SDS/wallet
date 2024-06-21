import { DeleteContactTypeEnum } from "@/common/const";
import { ContactErr, NewContactSubAccount } from "@redux/models/ContactsModels";

import { useState } from "react";
import { useAppSelector } from "@redux/Store";

export default function useContactTable() {
  const { protocol } = useAppSelector((state) => state.common);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteHpl, setDeleteHpl] = useState(false);
  const [deleteType, setDeleteType] = useState<DeleteContactTypeEnum>(DeleteContactTypeEnum.Enum.ASSET);
  const [selCntcPrinAddAsst, setSelCntcPrinAddAsst] = useState("");
  const [selContactPrin, setSelContactPrin] = useState("");
  const [openAssetsPrin, setOpenAssetsPrin] = useState("");
  const [openSubaccToken, setOpenSubaccToken] = useState("");

  const [addSub, setAddSub] = useState(false);
  const [contactEditedErr, setContactEditedErr] = useState<ContactErr>({
    name: false,
    principal: false,
  });

  const [selSubaccIdx, setSelSubaccIdx] = useState("");

  const [deleteObject, setDeleteObject] = useState<NewContactSubAccount>({
    principal: "",
    name: "",
    tokenSymbol: "",
    symbol: "",
    subaccIdx: "",
    subaccName: "",
    totalAssets: 0,
    TotalSub: 0,
  });

  return {
    protocol,
    selCntcPrinAddAsst,
    setSelCntcPrinAddAsst,
    selContactPrin,
    setSelContactPrin,
    openAssetsPrin,
    setOpenAssetsPrin,
    openSubaccToken,
    setOpenSubaccToken,
    selSubaccIdx,
    setSelSubaccIdx,
    deleteModal,
    setDeleteModal,
    deleteType,
    setDeleteType,
    deleteObject,
    setDeleteObject,
    contactEditedErr,
    setContactEditedErr,
    addSub,
    setAddSub,
    deleteHpl,
    setDeleteHpl,
  };
}
