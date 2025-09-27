// app/fonts.ts
import localFont from "next/font/local";

export const robotoRegular = localFont({
  src: "./fonts/roboto/Roboto-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-roboto-regular",
  display: "swap",
});

export const robotoMedium = localFont({
  src: "./fonts/roboto/Roboto-Medium.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-roboto-medium",
  display: "swap",
});
