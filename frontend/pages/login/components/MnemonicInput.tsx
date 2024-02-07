import { ReactComponent as CheckIcon } from "@assets/svg/files/edit-check.svg";
import { CustomInput } from "@components/Input";
import { handleSeedAuthenticated } from "@redux/CheckAuth";
import clsx from "clsx";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface MnemonicInputProps {
  phrase: string;
  setPhrase: Dispatch<SetStateAction<string>>;
}

export default function MnemonicInput({ phrase, setPhrase }: MnemonicInputProps) {
  return (
    <CustomInput
      sizeInput={"medium"}
      intent={"secondary"}
      compOutClass=""
      value={phrase}
      onChange={onPhraseChange}
      autoFocus
      sufix={
        <div className="flex flex-row items-center justify-start gap-2">
          <CheckIcon
            onClick={() => {
              // handleSeedAuthenticated(phrase);
            }}
            className={getCheckIconStyles(phrase)}
          />
          <p className="text-sm text-PrimaryTextColorLight dark:text-PrimaryTextColor">Max 32</p>
        </div>
      }
      onKeyDown={(e) => {
        // if (e.key === "Enter") handleSeedAuthenticated(phrase);
      }}
    />
  );
  function onPhraseChange(e: ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
    setPhrase(e.target.value);
  }
}

function getCheckIconStyles(phrase: string) {
  return clsx(
    "w-4 h-4 opacity-50 cursor-pointer",
    phrase.length > 0 ? "stroke-BorderSuccessColor" : "stroke-PrimaryTextColorLight dark:stroke-PrimaryTextColor",
  );
}
