// emotional.tsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User, Smile, Frown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const emotionalData = [
  { emotion: "Happy", percentage: 35, color: "bg-primary", icon: Smile },
  { emotion: "Sad", percentage: 25, color: "bg-accent", icon: Frown },
  { emotion: "Neutral", percentage: 20, color: "bg-secondary", icon: Meh },
  { emotion: "Anxious", percentage: 15, color: "bg-destructive", icon: Frown },
  { emotion: "Calm", percentage: 5, color: "bg-primary/50", icon: Smile },
];

const EmotionalAnalysis = () => {
  const { patientId } = useParams();

  // ✨ same header state/behavior as Dashboard
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

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
          {/* ===== Header (copied to match Dashboard) ===== */}
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

          {/* Notifications popover (with border) */}
          {showNotifications && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-2 rounded-md shadow-md max-w-sm mx-auto">
              <p className="font-bold text-sm">You have 3 new notifications</p>
            </div>
          )}

          {/* User info popover (with border) */}
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

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Emotional State Analysis
                </h2>
                <div className="space-y-6">
                  {emotionalData.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{item.emotion}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.percentage}%
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 bg-muted/50">
                <h3 className="text-xl font-bold mb-4">
                  Facial Expression Timeline
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Macroexpression analysis captured during conversation sessions,
                  showing emotional patterns over time.
                </p>
                <div className="bg-background/50 p-8 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    Timeline visualization will be displayed here based on
                    captured facial expression data
                  </p>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Key Observations</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <span>Predominant positive affect during initial conversation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent mt-2"></span>
                    <span>Increased sadness indicators when discussing school topics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary mt-2"></span>
                    <span>Neutral expressions maintained during most interactions</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-primary/10">
                <h3 className="text-xl font-bold mb-3">Analysis Summary</h3>
                <p className="text-sm text-muted-foreground">
                  The emotional analysis shows a mixed emotional state with
                  predominant positive affect, balanced by periods of sadness
                  and anxiety. This data complements the PHQ-9 screening results
                  and provides additional behavioral context for clinical
                  assessment.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmotionalAnalysis;
