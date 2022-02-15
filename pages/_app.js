import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@mui/material/styles";
import { GlobalProvider } from "../context/Context";
import theme from "../styles/theme";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <GlobalProvider>
        <ThemeProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </GlobalProvider>
    </SessionProvider>
  );
}

export default MyApp;
