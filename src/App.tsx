import { useEffect, type ReactNode } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { applyStoredTheme } from "./lib/theme";
import PublicLayout from "./layouts/PublicLayout";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BookstorePage from "./pages/BookstorePage";
import BroadcastsPage from "./pages/BroadcastsPage";
import ContactPage from "./pages/ContactPage";
import DevotionalPage from "./pages/DevotionalPage";
import DirectoryPage from "./pages/DirectoryPage";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import GivePage from "./pages/GivePage";
import HomePage from "./pages/HomePage";
import LocationsPage from "./pages/LocationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import SermonsPage from "./pages/SermonsPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminModulePage from "./pages/admin/AdminModulePage";
import AnalyticsTracker from "./components/common/AnalyticsTracker";

const pageTitles: Record<string, string> = {
  "/": "HOREMOW | Promoting Truth, Holiness and Righteousness",
  "/about": "About HOREMOW",
  "/sermons": "Sermons & Messages | HOREMOW",
  "/devotional": "Daily Devotional | HOREMOW",
  "/events": "Events & Conferences | HOREMOW",
  "/locations": "Fellowship Locations | HOREMOW",
  "/directory": "Overseers & Leadership Directory | HOREMOW",
  "/bookstore": "Bookstore | HOREMOW",
  "/gallery": "Gallery | HOREMOW",
  "/give": "Giving | HOREMOW",
  "/blog": "Journal | HOREMOW",
  "/broadcasts": "Broadcasts | HOREMOW",
  "/contact": "Contact HOREMOW",
};

function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title =
      pathname.startsWith("/admin")
        ? "Administration | HOREMOW"
        : pageTitles[pathname] ?? "Page not found | HOREMOW";
  }, [pathname]);

  return null;
}

function WithPublicLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

export default function App() {
  useEffect(() => {
    applyStoredTheme();
  }, []);

  return (
    <>
      <RouteMetadata />
      <AnalyticsTracker />
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path=":section" element={<AdminModulePage />} />
        </Route>
        <Route path="/" element={<WithPublicLayout><HomePage /></WithPublicLayout>} />
        <Route path="/about" element={<WithPublicLayout><AboutPage /></WithPublicLayout>} />
        <Route path="/sermons" element={<WithPublicLayout><SermonsPage /></WithPublicLayout>} />
        <Route path="/devotional" element={<WithPublicLayout><DevotionalPage /></WithPublicLayout>} />
        <Route path="/events" element={<WithPublicLayout><EventsPage /></WithPublicLayout>} />
        <Route path="/locations" element={<WithPublicLayout><LocationsPage /></WithPublicLayout>} />
        <Route path="/directory" element={<WithPublicLayout><DirectoryPage /></WithPublicLayout>} />
        <Route path="/bookstore" element={<WithPublicLayout><BookstorePage /></WithPublicLayout>} />
        <Route path="/gallery" element={<WithPublicLayout><GalleryPage /></WithPublicLayout>} />
        <Route path="/give" element={<WithPublicLayout><GivePage /></WithPublicLayout>} />
        <Route path="/blog" element={<WithPublicLayout><BlogPage /></WithPublicLayout>} />
        <Route path="/broadcasts" element={<WithPublicLayout><BroadcastsPage /></WithPublicLayout>} />
        <Route path="/contact" element={<WithPublicLayout><ContactPage /></WithPublicLayout>} />
        <Route path="*" element={<WithPublicLayout><NotFoundPage /></WithPublicLayout>} />
      </Routes>
    </>
  );
}
