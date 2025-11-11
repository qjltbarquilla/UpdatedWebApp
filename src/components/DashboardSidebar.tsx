import {NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Settings, LogOut, X, ChevronDown, FileText,
  BarChart3, Brain,
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

import AddPatientForm from "@/pages/AddPatientForm";


interface DashboardSidebarProps {
  selectedPatient?: {
    id: string;
    name: string;
  };
  onPatientAdded?: () => void; 
}

export const DashboardSidebar = ({ selectedPatient, onPatientAdded }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPatientOpen, setIsPatientOpen] = useState(!!selectedPatient);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleLogout = () => {
    console.log("🔒 Logging out user...");
    navigate("/login");
  };

  // handleExit = () => {
  //console.log("🚪 Exiting app...");

  // Try to close the window (will only work if this window was opened via window.open)
  //window.close();

  // Fallback: navigate to landing page
 // navigate("/");
//};




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

        {/* 🔹 Add Patient Button with Popup Form */}
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogTrigger asChild>
    <Button
      variant="ghost"
      className={`w-full justify-start font-bold ${
        isAddDialogOpen
          ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
          : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
      }`}
      style={{ fontFamily: '"Alef", sans serif' }}
    >
      <FileCheck className="mr-3 h-5 w-5" />
      Add Patient
    </Button>
  </DialogTrigger>

    <DialogContent
    className="bg-primary-foreground border-4 border-black rounded-2xl shadow-lg text-primary">
      
    <DialogHeader>
      <DialogTitle>Add New Patient</DialogTitle>
      <DialogDescription>
        Fill out the patient’s basic information below.
      </DialogDescription>
    </DialogHeader>

    <AddPatientForm
      onSuccess={() => {
        if (onPatientAdded) onPatientAdded();
        setIsAddDialogOpen(false);
      }}
    />
  </DialogContent>

</Dialog>


        {selectedPatient && (
  <Collapsible open={isPatientOpen} onOpenChange={setIsPatientOpen}>
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        className="text-primary-foreground font-normal hover:text-primary hover:bg-primary-foreground/50 hover:font-bold w-full justify-start text-sm"
        style={{ fontFamily: '"Alef", sans serif' }}
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
      {/* LIVE SESSION */}
<Link
  to={`/chat/${selectedPatient.id}`}
  state={{ patientName: selectedPatient.name }}   // 👈 add this
>
  <Button
    variant="ghost"
    className={`w-full justify-start text-sm font-bold ${
      location.pathname.includes("chat")
        ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
        : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
    }`}
    style={{ fontFamily: '"Alef", sans serif' }}
  >
    <MessageSquareText className="mr-3 h-4 w-4" />
    Live Session
  </Button>
</Link>

{/* TRANSCRIPT */}
<Link
  to={`/transcript/${selectedPatient.id}`}
  state={{ patientName: selectedPatient.name }}   // 👈 add this
>
  <Button
    variant="ghost"
    className={`w-full justify-start text-sm font-bold ${
      location.pathname.includes("transcript")
        ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
        : "text-primary-foreground font-normal hover:bg-primary-foreground/50 hover:font-bold"
    }`}
    style={{ fontFamily: '"Alef", sans serif' }}
  >
    <FileText className="mr-3 h-4 w-4" />
    Result
  </Button>
</Link>

      {/* Emotional Analysis link is now commented out, so leave it */}
      {/* 
      <Link to={`/emotional-analysis/${selectedPatient.id}`}>
        ...
      </Link>
      */}
    </CollapsibleContent>
  </Collapsible>
)}
      </nav>

      <div className="p-4 border-0 border-sidebar-border space-y-2">
        {/*<Button
          variant="ghost"
          className="w-full justify-start font-normal text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:font-bold"
                    style={{ fontFamily: '"Alef", sans serif'}}>
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>*/}

        {/* ✅ Logout (immediate) */}
        {/* ✅ Logout (with confirmation dialog) */}
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="ghost"
      className="w-full justify-start font-normal text-primary-foreground hover:bg-primary-foreground/50 hover:text-primary hover:font-bold"
                    style={{ fontFamily: '"Alef", sans serif'}}>
      <LogOut className="mr-3 h-5 w-5" />
      Logout
    </Button>
  </AlertDialogTrigger>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Log out of SnuggleMind?</AlertDialogTitle>
      <AlertDialogDescription>
        You&apos;ll be returned to the login page and your current session will end.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleLogout}>
        Logout
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


        {/* ✅ Exit (with confirmation dialog) */}
        {/*<AlertDialog>
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
        </AlertDialog>*/}
      </div>
    </aside>
  );
};
