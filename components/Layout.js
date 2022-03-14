import Navbar from "./Navbar";
import Head from "next/head";

const Layout = ({ children }) => {
  return (
    <div className="content">
      <Head>
        <title>Super One Acc | Admin Site</title>
        <meta
          name="description"
          content="Admin site for Super One Accessories"
        />
        <link rel="icon" href="/icon.png" />
      </Head>
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
