import { Routes, Route } from "react-router-dom";
import Registracija from "./components/FORUM/Registracija"
import MainLayout from "./routes/MainLayout";
import Forum from "./components/FORUM/Forum";
import Prijava from "./components/FORUM/Prijava";
import NovaObjava from "./components/FORUM/NovaObjava";
import Profile from "./components/FORUM/Profile";
import TermsOfService from "./components/TermsOfService/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";
import VerifyEmail from "./components/FORUM/VerifyEmail";
import ScrollToTop from "./components/ScrollToTop";
import ForgotPassword from "./components/FORUM/Password/ForgotPassword";
import ResetPassword from "./components/FORUM/Password/ResetPassword";
import PublicProfile from "./components/PublicProfile/PublicProfile";
import CookiesPolicy from "./components/Cookies/CookiesPolicy";
import About from "./components/Pages/About";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Forum />} />
          <Route path="/o-nas" element={<About />} />
          <Route path="/pogoji-uporabe" element={<TermsOfService />} />
          <Route path="/politika-zasebnosti" element={<PrivacyPolicy />} />
          <Route path="/registracija" element={<Registracija />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/prijava" element={<Prijava />} />
          <Route path="/novo" element={<NovaObjava />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/user/:id" element={<PublicProfile />} />
          <Route path="/politika-piskotkov" element={<CookiesPolicy />} />
        </Route>
      </Routes>



    </>

  );

}