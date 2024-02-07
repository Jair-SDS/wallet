import { HplContact } from "@redux/models/AccountModels";
import { useState } from "react";

export interface IUseContactFilters {
  assetOpen: boolean;
  addOpen: boolean;
  searchKey: string;
  assetFilter: string[];
  setAssetOpen: (open: boolean) => void;
  setAddOpen: (open: boolean) => void;
  setSearchKey: (key: string) => void;
  setAssetFilter: (filter: string[]) => void;
  edit: HplContact | undefined;
  setEdit(value: HplContact | undefined): void;
}

export default function useContactFilters(): IUseContactFilters {
  const [assetOpen, setAssetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [assetFilter, setAssetFilter] = useState<string[]>([]);
  const [edit, setEdit] = useState<HplContact>();

  return {
    assetOpen,
    addOpen,
    searchKey,
    assetFilter,
    setAssetOpen,
    setAddOpen,
    setSearchKey,
    setAssetFilter,
    edit,
    setEdit,
  };
}
