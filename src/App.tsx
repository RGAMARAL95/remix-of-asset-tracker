import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import ApplicationLayout from "./layouts/application-layout";
import AppShell from "./layouts/app-shell";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { SeedDataProvider, SupabaseDataProvider } from "@/lib/data-provider";
import { FilterProvider } from "@/lib/filter-context";

import Landing from "./pages/landing";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import AuthCallback from "./pages/auth-callback";
import Overview from "./pages/overview";
import Assets from "./pages/assets";
import AssetRouteRedirect from "./pages/assets-new";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          {/* Public — landing + auth */}
          <Route element={<ApplicationLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Route>

          {/* Demo — public, seed data, no auth */}
          <Route
            element={
              <SeedDataProvider>
                <FilterProvider>
                  <AppShell />
                </FilterProvider>
              </SeedDataProvider>
            }
          >
            <Route path="/demo/overview" element={<Overview />} />
            <Route path="/demo/assets" element={<Assets />} />
            <Route path="/demo/assets/new" element={<AssetRouteRedirect />} />
            <Route path="/demo/assets/:id" element={<AssetRouteRedirect />} />
          </Route>

          {/* App — protected, real Supabase data */}
          <Route
            element={
              <ProtectedRoute>
                <SupabaseDataProvider>
                  <FilterProvider>
                    <AppShell />
                  </FilterProvider>
                </SupabaseDataProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/overview" element={<Overview />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assets/new" element={<AssetRouteRedirect />} />
            <Route path="/assets/:id" element={<AssetRouteRedirect />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
