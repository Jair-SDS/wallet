import Menu from "@pages/components/Menu";
import AllowanceFilter from "./components/AllowanceFilter";
import AllowanceList from "./components/AllowanceList";
import AddAllowanceDrawer from "./components/AddAllowanceDrawer";
import UpdateAllowanceDrawer from "./components/UpdateAllowanceDrawer";
import useAllowances from "./hooks/useAllowances";

export default function Allowances() {
  const { allowances, handleSortChange, setSearchKey, assetFilters, setAssetFilters } = useAllowances();
  return (
    <div className=" w-full">
      <div className="flex items-center justify-between mt-[1.5rem] pr-4">
        <Menu noMargin={true} />
        <AllowanceFilter
          setSearchKey={setSearchKey}
          selectedAssets={assetFilters}
          setSelectedAssets={setAssetFilters}
        />
      </div>
      <AllowanceList allowances={allowances} handleSortChange={handleSortChange} />
      <AddAllowanceDrawer />
      <UpdateAllowanceDrawer />
    </div>
  );
}
