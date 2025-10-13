import {NavLink, Link, useLocation, useNavigate } from "react-router-dom";
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
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"; // 

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
    console.log("🔒 Logging out user...");
    navigate("/login");
  };

  const handleExit = () => {
    console.log("🚪 Exiting app...");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-0 border-sidebar-border">
        <Link to="/dashboard" className="text-xl text-primary font-bold tracking-tight hover:font-bold hover:text-primary/50"
                    style={{ fontFamily: '"Amatica SC", cursive', fontSize:"40px"}}>
          SNUGGLEMIND
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            className={`w-full justify-start font-bold ${
              location.pathname === "/dashboard"
                ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
            }`}
            style={{ fontFamily: '"Alef", sans serif'}}>
            <LayoutDashboard className="mr-3 h-5 w-5"/>
            Dashboard
          </Button>
        </Link>

        {selectedPatient && (
          <Collapsible open={isPatientOpen} onOpenChange={setIsPatientOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="text-primary-foreground font-normal hover:text-primary hover:bg-primary-foreground/50 hover:font-bold hover:text-primary w-full justify-start text-sm"
                  style={{ fontFamily: '"Alef", sans serif'}}>
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
                  className={`w-full justify-start text-sm font-bold ${
                    location.pathname.includes("transcript")
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
                  }`}
                  style={{ fontFamily: '"Alef", sans serif'}}
                >
                  <FileText className="mr-3 h-4 w-4" />
                  Transcript
                </Button>
              </Link>
              <Link to={`/phq9/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm font-bold ${
                    location.pathname.includes("phq9")
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
                  }`}
                  style={{ fontFamily: '"Alef", sans serif'}}
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  PHQ-9 Score
                </Button>
              </Link>
              <Link to={`/emotional-analysis/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm font-bold ${
                    location.pathname.includes("emotional-analysis")
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
                  }`}
                  style={{ fontFamily: '"Alef", sans serif'}}
                >
                  <Brain className="mr-3 h-4 w-4" />
                  Emotional Analysis
                </Button>
              </Link>
              <Link to={`/report-summary/${selectedPatient.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm font-bold ${
                    location.pathname.includes("report-summary")
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
                  }`}
                  style={{ fontFamily: '"Alef", sans serif'}}
                >
                  <FileCheck className="mr-3 h-4 w-4" />
                  Report Summary
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        )}
      </nav>

      <div className="p-4 border-0 border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start font-normal text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:font-bold"
                    style={{ fontFamily: '"Alef", sans serif'}}>
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>

        {/* ✅ Logout (immediate) */}
        <Button
          variant="ghost"
          className="w-full justify-start font-normal text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:font-bold"
                    style={{ fontFamily: '"Alef", sans serif'}}
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>

        {/* ✅ Exit (with confirmation dialog) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start font-normal text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:font-bold"
                    style={{ fontFamily: '"Alef", sans serif'}}>
              <X className="mr-3 h-5 w-5" />
              Exit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current session will be closed. Any unsaved data may be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleExit}>Exit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
};
