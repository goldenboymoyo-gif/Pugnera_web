import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Boxing streaming — live and on-demand fights, highlights, rankings and classic bouts." />
        <link rel="icon" type="image/png" href="/boxing/logo/image.png" />
        <link rel="apple-touch-icon" href="/boxing/logo/image.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
