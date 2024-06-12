// svg
import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { ReactComponent as CloseIcon } from "@assets/svg/files/close.svg";
//
import { CustomInput } from "@components/input";
import useNewServices from "../hooks/useNewService";

interface NewServiceRowProps {
  setAddService(value: boolean): void;
  setNewService(value: boolean): void;
}

export const NewServiceRow = (props: NewServiceRowProps) => {
  const { setAddService, setNewService } = props;
  const {
    newService,
    newServiceErr,
    onServiceNameChange,
    onServicePrincipalChange,
    saveService,
    setNewServiceErr,
    showDuplicate,
    setShowDuplicate,
  } = useNewServices();
  return (
    <tr className="border-b border-BorderColorTwoLight dark:border-BorderColorTwo bg-SelectRowColor/10">
      <td>
        <div className="relative flex flex-row items-center justify-start w-full gap-2 px-4 min-h-14">
          <div className="absolute left-0 w-1 h-14 bg-SelectRowColor"></div>
          <CustomInput
            intent={"primary"}
            border={newServiceErr.name ? "error" : "selected"}
            sizeComp={"xLarge"}
            sizeInput="small"
            value={newService.name}
            onChange={onServiceNameChange}
            autoFocus
          />
        </div>
      </td>
      <td>
        <CustomInput
          intent={"primary"}
          border={newServiceErr.principal ? "error" : "selected"}
          sizeComp={"xLarge"}
          sizeInput="small"
          value={newService.principal}
          onChange={onServicePrincipalChange}
          sufix={showDuplicate ? <p className="text-sm text-slate-color-error">Duplicate</p> : <></>}
        />
      </td>
      <td>
        <div className="flex flex-row justify-around items-center">
          <CheckIcon onClick={onSave} className="w-4 h-4 opacity-50 cursor-pointer stroke-slate-color-success" />
          <CloseIcon onClick={onClose} className="w-5 h-5 opacity-50 cursor-pointer stroke-slate-color-error" />
        </div>
      </td>
      <td></td>
    </tr>
  );

  function onClose() {
    setAddService(false);
    setNewService(false);
  }
  async function onSave() {
    const res = await saveService();
    console.log(res);

    if (res.success) onClose();
    else {
      if (res.err === "service-name-data-err")
        setNewServiceErr((prev: any) => {
          return { name: true, principal: prev.principal };
        });
      else {
        setNewServiceErr((prev: any) => {
          return { name: prev.name, principal: true };
        });
        if (res.err === "service-duplicate-err") {
          setShowDuplicate(true);
        }
      }
    }
  }
};
