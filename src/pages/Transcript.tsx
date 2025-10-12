// transcript.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";


const Transcript = () => {
  const { patientId } = useParams();


  // ✨ added: same states as dashboard header
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");


  // header popovers
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);


  // ✨ added: load username like on dashboard
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);


  const handleNotificationClick = () => {
    setShowNotifications(true);
    setTimeout(() => setShowNotifications(false), 2000);
  };


  const handleUserIconClick = () => {
    setShowUserInfo(true);
    setTimeout(() => setShowUserInfo(false), 2000);
  };


  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        selectedPatient={{ id: patientId || "", name: "Hinako" }}
      />


      <main className="flex-1 bg-background">
        <div className="p-8">
          {/* ===== Header copied from Dashboard ===== */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-primary/50 rounded-full bg-sidebar/20"
                />
              </div>
            </div>


            {/* right-side icons */}
            <div className="flex items-center gap-3">
              <Button
                className="p-2 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleNotificationClick}
              >
                <Bell className="h-6 w-6" />
              </Button>


              <div className="flex items-center gap-2">
                <Button
                  className="p-2 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleUserIconClick}
                >
                  <User className="h-6 w-6" />
                </Button>
                <span className="text-primary font-regular">{username}</span>
              </div>
            </div>
          </div>


          {/* notifications popover */}
          {showNotifications && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-2 rounded-md shadow-md max-w-sm mx-auto">
              <p className="font-bold text-sm">You have 3 new notifications</p>
            </div>
          )}


          {/* user info popover */}
          {showUserInfo && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-3 rounded-md shadow-md max-w-sm mx-auto">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <span className="font-bold">{username}</span>
              </div>
              <p className="text-sm">Welcome to your dashboard!</p>
            </div>
          )}
          {/* ===== End header ===== */}


          <Card className="p-8 min-h-[600px] bg-sidebar/50">
            <h2 className="text-2xl font-bold mb-6">
              Conversation Transcript - Hinako
            </h2>
            <div className="prose max-w-none text-foreground/80">
              <p className="mb-4">
                This area will display the full transcript of the conversation
                between the child and the AI system. The transcript is captured
                through speech-to-text conversion during the interaction with
                the plush toy attachment.
              </p>
              <div className="bg-background/50 p-6 rounded-lg mt-8">
                <p className="text-sm text-muted-foreground italic">
                  Transcript content will be populated based on user
                  conversation data from the hardware system...
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};


export default Transcript;