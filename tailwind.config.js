/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./frontend/**/*.{js,ts,jsx,tsx}"],
  variants: {
    extend: {},
  },
  plugins: [],
  theme: {
    extend: {
      transitionProperty: {
        "height": "height",
        "spacing": "margin, padding",
        "width": "width"
      }
    },
    fontSize: {
      xm: ".55rem",
      sm: ".7rem",
      md: ".85rem",
      lg: "1rem",
      xl: "1.25rem",
      "2x1": "1.5rem",
      "3x1": "1.75rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "4rem",
      "7xl": "5rem",
    },
    screens: {
      "defaults": "1475px",
    },
    colors: {
      PrimaryColor: "#1b183f",
      PrimaryColorLight: "#ffffff",
      SecondaryColor: "#211e49",
      SecondaryColorLight: "#f2f2f1",
      ThirdColor: "#131030",
      ThirdColorLight: "#bfbfbf",
      PrimaryTextColor: "#ffffff",
      PrimaryTextColorLight: "#1b183f",
      SecondaryTextColor: "#b1afcd",
      SecondaryTextColorLight: "#211e49",
      ThirdTextColor: "#ffffffb3",
      ThirdTextColorLight: "#2b2759b3",
      ThemeColorBack: "#151331",
      ThemeColorBackLight: "#e3e3e3",
      ThemeColorSelector: "#19173a",
      ThemeColorSelectorLight: "#ffffff",
      HoverColorLight: "#bfbfbf",
      HoverColor: "#332F60",
      BorderColor: "#68658b",
      BorderColorLight: "#bfbfbf",
      BorderColorTwo: "#2B2759",
      BorderColorTwoLight: "#919191",
      BorderColorThree: "#2b2759",
      BorderColorThreeLight: "#2b275926",
      BorderColorFourth: "#444277",
      BorderColorFourthLight: "#2b275926",
      BorderSuccessColor: "#3BC9A9",
      PopSelectColor: "#332f60",
      PopSelectColorLight: "#32aee91a",
      LockColor: "#b0736f",
      RadioCheckColor: "#33b2ef",
      RadioNoCheckColor: "#444277",
      RadioNoCheckColorLight: "#4442777f",
      SvgColorLight: "#6F6C99",
      SvgColor: "#6F6C99",
      AccpetButtonColor: "#33B2EF",
      DenyButtonColor: "#332F60",
      SearchInputBorder: "#444277",
      SearchInputBorderLight: "#DFDFE6",
      TransactionHeaderColor: "#2a316b",
      TransactionHeaderColorLight: "#DBE4ED",
      TextErrorColor: "#F5797D",
      TextSendColor: "#F5797D",
      TextReceiveColor: "#3BC9A9",
      SelectRowColor: "#33B2EF",
      SelectRowColorLight: "#33B2EF3D",
      AddSubaccount: "#0D4864",
      ReceiverColor: "#8A9CB7",
      FromBoxColor: "#1C1940",
      FromBoxColorLight: "#DBE4ED",
      ToBoxColor: "#141331",
      GrayColor: "#B1AFCD",
      SideColor: "#211E49",
      ToBoxLetterColor: "#5F8E88",
      AddSecondaryButton: "#125D81",
      ContactColor1: "#8A9CB7",
      ContactColor2: "#61A0BE",
      ContactColor3: "#5F8E88",
      RemoteAmount: "#7BD3FF",


      black: colors.black,
      white: colors.white,
      slate: colors.slate,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
      transparent: colors.transparent,
      current: colors.current,
      inherit: colors.inherit,
    }
  },
}

