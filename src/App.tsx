import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "./store";
import Layout from "./Layout";

// Pages
import { Login, Signup, Logout } from "./pages/Auth";
import { Settings, ManagePage, ManageReferral } from "./pages/Profile";
import Overview from "./pages/Overview";
import { Campaign } from "./pages/ManageCampaign";
import { History } from "./pages/History";
import { TestingLink, Browser, Workflow } from "./pages/Campaignredirect";
import { DynamicIframe } from "./pages/iframe";

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup/:ref" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="campaign" element={<Campaign />} />
            <Route path="manage-page" element={<ManagePage />} />
            <Route path="manage-referral" element={<ManageReferral />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="testing-link" element={<TestingLink />} />
            <Route path="browser" element={<Browser />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="view/single/:id" element={<DynamicIframe />} />
            <Route path="view/page/:groupId/:pageId" element={<DynamicIframe />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default App;