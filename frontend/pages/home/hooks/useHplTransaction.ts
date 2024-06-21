import { useAppSelector } from "@redux/Store";
export default function useHplTransaction() {
  const { amount, sendingStatus, initTime, endTime, hplSender, hplReceiver, hplFtTx } = useAppSelector(
    (state) => state.hplTransaction,
  );

  return {
    amount,
    sendingStatus,
    initTime,
    endTime,
    hplSender,
    hplReceiver,
    hplFtTx,
  };
}
