import { AuthProvider } from "../context/AuthContext";
import "@/styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "../context/ThemeContext";
import dynamic from "next/dynamic";
import { AccountProvider } from "@/context/AccountContext";
const ThemeWrapper = dynamic(() => import("@/components/theme/ThemeWrapper"), {
  ssr: false,
});
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        {" "}
        <ThemeProvider>
          <ThemeWrapper>
            <AccountProvider>
              <Component {...pageProps} />
              <Analytics />
              <SpeedInsights />
            </AccountProvider>
          </ThemeWrapper>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}
