export const roundToDecimalN = (numb: number | string, decimal: number | string) => {
  return Math.round(Number(numb) * Math.pow(10, Number(decimal))) / Math.pow(10, Number(decimal));
};

export const toNumberFromUint8Array = (Uint8Arr: Uint8Array) => {
  const size = Uint8Arr.length;
  const buffer = Buffer.from(Uint8Arr);
  const result = buffer.readUIntBE(0, size);
  return result;
};

export function getDecimalAmount(numb: number | string, decimal: number | string, direct?: boolean) {
  if (Number(numb) === 0) return "0";
  const x = Number(numb) / Math.pow(10, Number(decimal));
  return direct ? x.toString() : x.toLocaleString("en-US", { maximumFractionDigits: 20 });
}
