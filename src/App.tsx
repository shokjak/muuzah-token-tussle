import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MuuzahGame } from "@/components/game/MuuzahGame";

const queryClient = new QueryClient();

// Note: No BrowserRouter - Devvit webviews don't support browser navigation
// The app runs in an iframe and all "routing" is handled via component state
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MuuzahGame />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
