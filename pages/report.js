import { Container } from "@mui/material";
import { getSession } from "next-auth/react";

const ProductDisplay = ({ user }) => {
  return <Container></Container>;
};

export default ProductDisplay;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
