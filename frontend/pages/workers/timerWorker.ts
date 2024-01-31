// eslint-disable-next-line no-restricted-globals
const timerCode = () => {
  self.onmessage = () => {
    self.postMessage({ wType: "TRANSACTIONS" });
    setInterval(() => {
      self.postMessage({ wType: "TRANSACTIONS" });
    }, 10 * 60 * 1000);
    setInterval(() => {
      const updatedAt = Date.now();
      self.postMessage({ wType: "ASSETS", updatedAt });
    }, 10 * 60 * 1000);
  };
};

let code = timerCode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "text/javascript" });
const timer_script = URL.createObjectURL(blob);

export default timer_script;
