import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThoughtFlowProvider } from "@/context/ThoughtFlowContext";
import { CleanAppRouter } from "./components/CleanAppRouter";
import { SecurityProvider } from "./components/SecurityProvider";
import SharedInsight from "./pages/SharedInsight";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('Authentication required')) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThoughtFlowProvider>
        <SecurityProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-gray-50">
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/auth/*" element={<Auth />} />
                <Route path="/shared-insight/:insightId" element={<SharedInsight />} />
                <Route path="/*" element={<CleanAppRouter />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </SecurityProvider>
      </ThoughtFlowProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
