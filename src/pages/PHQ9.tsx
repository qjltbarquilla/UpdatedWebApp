// phq9.tsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { question: "Q1", score: 2.0, severity: "Several days" },
  { question: "Q2", score: 1.0, severity: "Not at all" },
  { question: "Q3", score: 3.0, severity: "Nearly everyday" },
  { question: "Q4", score: 2.0, severity: "Several days" },
  { question: "Q5", score: 1.0, severity: "Not at all" },
  { question: "Q6", score: 2.0, severity: "Several days" },
  { question: "Q7", score: 1.0, severity: "Not at all" },
  { question: "Q8", score: 1.0, severity: "Not at all" },
  { question: "Q9", score: 1.0, severity: "Not at all" },
];

const PHQ9 = () => {
  const { patientId } = useParams();

  // ✨ same header state as Dashboard
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

  const getBarColor = (score: number) => {
    if (score >= 2.5) return "hsl(var(--accent))";
    if (score >= 2.0) return "hsl(var(--secondary))";
    return "hsl(var(--primary))";
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

          {/* Notifications popover */}
          {showNotifications && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-2 rounded-md shadow-md max-w-sm mx-auto">
              <p className="font-bold text-sm">You have 3 new notifications</p>
            </div>
          )}

          {/* User info popover */}
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
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  PHQ-9 Depression Screening Score
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis domain={[0, 3.5]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Card className="p-6 bg-muted/50">
                    <h3 className="font-semibold mb-3">Voice Input Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Analysis of speech patterns, tone, and emotional markers
                      detected during conversation sessions.
                    </p>
                  </Card>
                  <Card className="p-6 bg-muted/50">
                    <h3 className="font-semibold mb-3">Behavioral Markers</h3>
                    <p className="text-sm text-muted-foreground">
                      Facial expression data and behavioral patterns observed
                      through macroexpression analysis.
                    </p>
                  </Card>
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 rounded bg-primary"></div>
                    <span className="text-sm">Not at all</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 rounded bg-secondary"></div>
                    <span className="text-sm">Several days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-4 rounded"
                      style={{ backgroundColor: "hsl(var(--muted))" }}
                    ></div>
                    <span className="text-sm">More than half the days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 rounded bg-accent"></div>
                    <span className="text-sm">Nearly everyday</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold mb-3">Total Score: 14</h4>
                  <p className="text-sm text-muted-foreground">
                    Severity Level: Moderate Depression
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: This is a preliminary screening tool. Clinical
                    diagnosis should be made by qualified mental health
                    professionals.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PHQ9;
