import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon & Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/pigb-logo.png" />
        <meta name="theme-color" content="#00b894" />

        {/* Primary Meta */}
        <meta name="title" content="PigB - Manage Income, Expenses, Budgets & Savings" />
        <meta
          name="description"
          content="PigB helps you manage your finances with ease — track income, expenses, budgets, loans, and savings all in one place."
        />

        {/* Open Graph  */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pigb.sehgaltech.com/" />
        <meta property="og:title" content="PigB - Smart Finance Manager" />
        <meta
          property="og:description"
          content="Track income, expenses, budgets, loans, and savings with PigB."
        />
        <meta property="og:image" content="/pigb-logo.png" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PigB",
              url: "https://pigb.sehgaltech.com",
              logo: "https://pigb.sehgaltech.com/favicon.ico",
            }),
          }}
        />
        {/* <script
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
        /> */}
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
