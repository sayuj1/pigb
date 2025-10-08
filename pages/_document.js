import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const SITE_URL = "https://pigb.sehgaltech.com";
  const SITE_NAME = "PIGB SehgalTech";
  const LOGO_URL = `${SITE_URL}/logo.png`;
  return (
    <Html lang="en">
      <Head >
        {/* for bing verification */}
        <meta name="msvalidate.01" content="62E5512162829959A26CF94DC4194DF9" />
        {/* JSON-LD: Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": SITE_URL,
              "name": SITE_NAME,
              "logo": LOGO_URL
            }),
          }}
        />

        {/* JSON-LD: WebSite schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": SITE_URL,
              "name": SITE_NAME,
              "publisher": {
                "@type": "Organization",
                "name": SITE_NAME,
                "logo": {
                  "@type": "ImageObject",
                  "url": LOGO_URL
                }
              }
            }),
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Pigb" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
