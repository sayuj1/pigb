import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-NLHS74D5');
      `,
          }}
        />

        <script
          src="https://www.googletagmanager.com/gtag/js?id=G-JW36P6XPLZ"
          strategy="afterInteractive"
        />
        <script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JW36P6XPLZ', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
      </Head>

      <body className="antialiased">
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NLHS74D5"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe></noscript>

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
