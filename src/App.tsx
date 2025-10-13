import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Transcript from "./pages/Transcript.tsx";
import PHQ9 from "./pages/PHQ9";
import EmotionalAnalysis from "./pages/EmotionalAnalysis";
import ReportSummary from "./pages/ReportSummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
  <Toaster />
  <Sonner

    toastOptions={{
      classNames: {
        toast: "border-primary",            // 👈 adds primary border to all toasts
      }
    }}
  />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:patientId" element={<ChatPage />} />
          <Route path="/transcript/:patientId" element={<Transcript />} />
          // App.tsx
          <Route path="/phq9/:patientId" element={<PHQ9 />} />
          <Route path="/emotional-analysis/:patientId" element={<EmotionalAnalysis />} />
          <Route path="/report-summary/:patientId" element={<ReportSummary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
