import type { AppProps } from "next/app";
// This tells the pages folder to grab the CSS from your app folder
import "../app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
