import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

const links = ["Dashboard", "Products", "Orders", "Report", "Settings"];

const Navbar = () => {
  const { data: session } = useSession();
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar className="nav-container" sx={{ px: 2 }} position="static">
      <Container maxWidth="xxl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            LOGO
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              LOGO
            </Box>

            {session && (
              <Box>
                <IconButton
                  size="large"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {links.map((link) => (
                    <MenuItem key={link} onClick={handleCloseNavMenu}>
                      <Link href={`/${link.toLowerCase()}`}>{link}</Link>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}
          </Box>

          {session && (
            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              {links.map((link) => (
                <Link href={`/${link.toLowerCase()}`} key={link}>
                  <Typography sx={{ paddingLeft: 2 }}>{link}</Typography>
                </Link>
              ))}
            </Box>
          )}

          {!session && (
            <Button variant="outlined" color="secondary">
              <Link href="/">Set Roles</Link>
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
