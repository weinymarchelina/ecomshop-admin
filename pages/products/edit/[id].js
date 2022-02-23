import { Card, Container } from "@mui/material";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

const EditProduct = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);

  return (
    <Container>
      <Card></Card>
    </Container>
  );
};

export default EditProduct;

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
