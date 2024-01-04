interface SwitchButtonProps {
  textLeft?: string;
  textRight?: string;
  enabled: boolean;
  onToggle: any;
}

const SwitchButton = ({ textLeft, textRight, enabled, onToggle }: SwitchButtonProps) => {
  return (
    <div className="flex flex-row justify-start items-center gap-2">
      {textLeft && <p className="opacity-70">{textLeft}</p>}
      <div
        className={`flex flex-row w-9 h-4 rounded-full relative cursor-pointer items-center ${
          enabled ? "bg-[#26A17B]" : "bg-[#7E7D91]"
        }`}
        onClick={onToggle}
      >
        <div
          className={`w-3 h-3 rounded-full bg-white transition-spacing duration-300 ${enabled ? "ml-5" : "ml-1"}`}
        ></div>
      </div>
      {textRight && <p className="opacity-70">{textRight}</p>}
    </div>
  );
};

export default SwitchButton;
