import { Outlet, useLocation } from "react-router-dom";
import NavbarForum from "../components/FORUM/NavbarForum";
import MobileFooterNavbar from "../components/FORUM/MobileFooterNavbar";
import { Box } from "@chakra-ui/react";

const MainLayout = () => {
  const location = useLocation();
  const showMobileFooter = location.pathname !== "/o-nas";

  return (
    <>
      <NavbarForum />
      <Box pb={{ base: showMobileFooter ? "70px" : "0", md: "0" }}>
        <Outlet />
      </Box>
      {showMobileFooter && <MobileFooterNavbar />}
    </>
  )
}

export default MainLayout
