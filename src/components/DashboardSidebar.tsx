import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  ChevronDown,
  FileText,
  BarChart3,
  Brain,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DashboardSidebarProps {
  selectedPatient?: {
    id: string;
    name: string;
  };
}

export const DashboardSidebar = ({ selectedPatient }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPatientOpen, setIsPatientOpen] = useState(!!selectedPatient);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="text-xl font-bold">
          SNUGGLEMIND
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              location.pathname === "/dashboard"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
        </Link>

        {selectedPatient && (
          <Collapsible open={isPatientOpen} onOpenChange={setIsPatientOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <ChevronDown
                  className={`mr-2 h-4 w-4 transition-transform ${
                    isPatientOpen ? "" : "-rotate-90"
                  }`}
                />
                {selectedPatient.name}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-6">
              <Link to={`/transcript/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    location.pathname.includes("transcript")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <FileText className="mr-3 h-4 w-4" />
                  Transcript
                </Button>
              </Link>
              <Link to={`/phq9/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    location.pathname.includes("phq9")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  PHQ-9 Score
                </Button>
              </Link>
              <Link to={`/emotional-analysis/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    location.pathname.includes("emotional-analysis")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Brain className="mr-3 h-4 w-4" />
                  Emotional Analysis
                </Button>
              </Link>
              <Link to={`/report-summary/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    location.pathname.includes("report-summary")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <FileCheck className="mr-3 h-4 w-4" />
                  Report Summary
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <X className="mr-3 h-5 w-5" />
          Exit
        </Button>
      </div>
    </aside>
  );
};
