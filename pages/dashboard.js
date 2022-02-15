import { Container, Typography, Button } from "@mui/material";
import { getSession } from "next-auth/react";

const Dashboard = ({ user }) => {
  return (
    <Container>
      {user && (
        <>
          <Typography>Welcome {user.name}</Typography>
        </>
      )}
    </Container>
  );
};

export default Dashboard;

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
