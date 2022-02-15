import { Container } from "@mui/material";
import { getSession, signOut, signIn } from "next-auth/react";
import { setCookies } from "cookies-next";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BadgeIcon from "@mui/icons-material/Badge";
import Link from "next/link";

const Auth = () => {
  return (
    <Container sx={{ flexGrow: 1 }}>
      <Card variant="outlined">
        <CardContent>
          <Button variant="contained" endIcon={<AddBusinessIcon />}>
            <Link href="/roles/owner">business owner</Link>
          </Button>

          <Button variant="contained" endIcon={<BadgeIcon />}>
            <Link href="/roles/employee">employee</Link>
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setCookies("status", {
                role: "Unknown",
              });
              signIn(null, {
                callbackUrl: `${window.location.origin}/`,
              });
            }}
          >
            I'm an old user
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Auth;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: { user: null },
    };
  }

  return {
    props: { user: session.user },
  };
}
