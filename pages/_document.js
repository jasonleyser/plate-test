import Document, { Html, Head, Main, NextScript } from "next/document";
import Navbar from "~/components/Navbar";
import Slate from "~/common/slate";

import { extractCritical } from "emotion-server";

import injectGlobalStyles from "~/common/styles/global";

injectGlobalStyles();

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const page = renderPage();
    const styles = extractCritical(page.html);
    return { ...page, ...styles };
  }

  constructor(props) {
    super(props);
    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = ids;
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
        </Head>
        <body>
          <Navbar data={this.props} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
