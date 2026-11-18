import { useLocation } from "react-router-dom";
import AdminContentEditor from "../../components/admin/AdminContentEditor";
import AdminSermonsManager from "../../components/admin/AdminSermonsManager";
import AdminDevotionalsManager from "../../components/admin/AdminDevotionalsManager";
import AdminEventsManager from "../../components/admin/AdminEventsManager";
import AdminGalleryManager from "../../components/admin/AdminGalleryManager";
import AdminBookstoreManager from "../../components/admin/AdminBookstoreManager";
import AdminLocationsManager from "../../components/admin/AdminLocationsManager";
import AdminGivingManager from "../../components/admin/AdminGivingManager";
import AdminBlogManager from "../../components/admin/AdminBlogManager";
import AdminBroadcastsManager from "../../components/admin/AdminBroadcastsManager";
import AdminSettingsManager from "../../components/admin/AdminSettingsManager";
import AdminTransactionsPage from "./AdminTransactionsPage";
import AdminAnalyticsPage from "./AdminAnalyticsPage";
import AdminDirectoryManager from "../../components/admin/AdminDirectoryManager";
import AdminUsersManager from "../../components/admin/AdminUsersManager";

export default function AdminModulePage() {
  const { pathname } = useLocation();
  const key = pathname.split("/")[2] ?? "content";

  const renderModuleContent = () => {
    switch (key) {
      case "transactions":
        return <AdminTransactionsPage />;
      case "analytics":
        return <AdminAnalyticsPage />;
      case "directory":
        return <AdminDirectoryManager />;
      case "users":
        return <AdminUsersManager />;
      case "content":
        return <AdminContentEditor />;
      case "sermons":
        return <AdminSermonsManager />;
      case "devotionals":
        return <AdminDevotionalsManager />;
      case "events":
        return <AdminEventsManager />;
      case "gallery":
        return <AdminGalleryManager />;
      case "bookstore":
        return <AdminBookstoreManager />;
      case "locations":
        return <AdminLocationsManager />;
      case "donations":
        return <AdminGivingManager />;
      case "blog":
        return <AdminBlogManager />;
      case "broadcasts":
        return <AdminBroadcastsManager />;
      case "settings":
        return <AdminSettingsManager />;
      default:
        return <AdminContentEditor />;
    }
  };

  return renderModuleContent();
}
