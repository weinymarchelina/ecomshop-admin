import { getSession, signIn } from "next-auth/react";
import { setCookies } from "cookies-next";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BadgeIcon from "@mui/icons-material/Badge";
import Link from "next/link";
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Home({ user }) {
  const matches = useMediaQuery("(max-width:600px)");

  return (
    <Container
      className="flex-row"
      sx={{
        py: 5,
      }}
      maxWidth={"md"}
    >
      {!user && (
        <Card variant="outlined" sx={{ width: "100%" }}>
          <CardContent sx={{ p: 5, textAlign: "center" }} className="f-column">
            <Typography
              sx={{ lineHeight: "100%", mb: 3 }}
              className="main-title"
              variant="h3"
              component="h1"
              gutterBottom
            >
              Set Your Role
            </Typography>

            <Typography
              sx={{ lineHeight: "125%" }}
              variant="h6"
              component="p"
              gutterBottom
            >{`Welcome new user, let's set your role to sign in!`}</Typography>

            <img
              className="svg-login"
              src="/svg-login.svg"
              alt="login-set-role-img"
            />

            <ButtonGroup
              variant="contained"
              size="large"
              orientation={matches ? "vertical" : "horizontal"}
            >
              <Button endIcon={<AddBusinessIcon />} sx={{ px: 3 }}>
                <Link href="/roles/owner">business owner</Link>
              </Button>

              <Button endIcon={<BadgeIcon />} sx={{ px: 3 }}>
                <Link href="/roles/employee">employee</Link>
              </Button>
            </ButtonGroup>

            <Button
              sx={{ width: "100%", mt: 1 }}
              size="small"
              onClick={() => {
                setCookies("status", {
                  role: "Unknown",
                });
                signIn(null, {
                  callbackUrl: `${window.location.origin}/`,
                });
              }}
            >
              Have an account before? Login here
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: { user: null },
    };
  }

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
