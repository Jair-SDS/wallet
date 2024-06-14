import { TransactionScannerOptionEnum, TransactionSenderOptionEnum } from "@/@types/transactions";
import { subUint8ArrayToHex } from "@common/utils/unitArray";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import QRscanner from "@pages/components/QRscanner";
import {
  setIsNewSenderAction,
  setScannerActiveOptionAction,
  setSenderContactNewAction,
  setSenderOptionAction,
} from "@redux/transaction/TransactionActions";
import logger from "@/common/utils/logger";

export default function SenderAllowanceQRScanner() {
  return (
    <QRscanner
      setQRview={onGoBack}
      qrView={true}
      onSuccess={(value: string) => {
        try {
          const decoded = decodeIcrcAccount(value);
          const scannedContact = {
            principal: decoded.owner.toText(),
            subAccountId: `0x${subUint8ArrayToHex(decoded.subaccount)}`,
          };
          setSenderContactNewAction(scannedContact);
          onGoBack();
        } catch (error) {
          logger.debug(error);
        }
      }}
    />
  );

  function onGoBack() {
    setIsNewSenderAction(true);
    setSenderOptionAction(TransactionSenderOptionEnum.Values.allowance);
    setScannerActiveOptionAction(TransactionScannerOptionEnum.Values.none);
  }
}
