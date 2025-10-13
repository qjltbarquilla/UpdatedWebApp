import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bell,
  User,
  ArrowLeft,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ===== Types ===== */
interface SessionSummary {
  _id: string;
  session_id: string;
  timestamp: string;
  total_score: number;
  severity_band: string;
  message_count: number;
}
interface SessionAnalysis {
  session_id: string;
  timestamp: string;
  conversation_text: string;
  total_score: number;
  severity_band: string;
}

const Transcript = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();

  // Sidebar identity
  const validPatientId = patientId && patientId !== "N/A" ? patientId : "1";
  const displayName = validPatientId === "1" ? "Hinako" : `Patient ${validPatientId}`;

  // Data state
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Header state (matched to ChatPage)
  const [searchQuery, setSearchQuery] = useState("");      // renamed from `search`
  const [username, setUsername] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("username");
    if (u) setUsername(u);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setTimeout(() => setShowNotifications(false), 2000);
  };
  const handleUserIconClick = () => {
    setShowUserInfo(true);
    setTimeout(() => setShowUserInfo(false), 2000);
  };

  /* ===== Load sessions ===== */
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/get-sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");

        const data = await response.json();
        if (!data || data.length === 0) {
          const demoRes = await fetch("http://localhost:8000/get-transcript-demo");
          if (demoRes.ok) {
            const demo = await demoRes.json();
            setSessions([
              {
                _id: demo._id,
                session_id: demo.session_id,
                timestamp: demo.timestamp,
                total_score: demo.total_score,
                severity_band: demo.severity_band,
                message_count:
                  demo.message_count || demo.conversation_text.split("\n").length,
              },
            ]);
          } else {
            setSessions([]);
          }
        } else {
          setSessions(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  /* ===== Open session from route param ===== */
  useEffect(() => {
    if (!patientId) return;
    fetchSessionDetail(patientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchSessionDetail = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/get-session/${sessionId}`);
      if (!res.ok) {
        const demoRes = await fetch("http://localhost:8000/get-transcript-demo");
        if (!demoRes.ok) throw new Error("Demo transcript unavailable");
        const demo = await demoRes.json();
        setSelectedSession(demo);
      } else {
        const data = await res.json();
        setSelectedSession(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (sessionId: string, format: "pdf" | "json") => {
    const url = `http://localhost:8000/generate-report/${sessionId}?format=${format}`;
    window.open(url, "_blank");
  };

  // filter using the new state name
  const filteredSessions = sessions.filter(
    (s) =>
      s.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.severity_band.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ===== UI ===== */
  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar selectedPatient={{ id: validPatientId, name: displayName }} />

      <main className="flex-1 bg-background">
        <div className="p-4 md:p-8">
          {/* 🔹 Top bar (colors & layout matched to ChatPage) */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input
                  placeholder={
                    selectedSession
                      ? "Search is for session list…"
                      : "Search by session ID or severity…"
                  }
                  className="pl-9 h-10 text-primary/50 rounded-full bg-sidebar/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  // keep enabled to match ChatPage feel
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

          {/* 🔹 Popovers (same style as ChatPage) */}
          {showNotifications && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-2 rounded-md shadow-md max-w-sm mx-auto">
              <p className="font-bold text-sm">You have 3 new notifications</p>
            </div>
          )}
          {showUserInfo && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-3 rounded-md shadow-md max-w-sm mx-auto">
            <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <span className="font-bold">{username}</span>
              </div>
              <p className="text-sm">Welcome to your dashboard!</p>
            </div>
          )}

          {/* Main Card */}
          <Card className="p-8 min-h-[600px] bg-muted/50 overflow-y-auto">
            {selectedSession ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Conversation Transcript</h2>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setSelectedSession(null)}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to History
                    </Button>

                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                      onClick={() => handleDownload(selectedSession.session_id, "pdf")}
                    >
                      <Download className="h-4 w-4" /> PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleDownload(selectedSession.session_id, "json")}
                    >
                      <FileText className="h-4 w-4" /> JSON
                    </Button>
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Loading transcript...
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 font-medium">
                    ⚠️ {error}
                  </div>
                )}

                {!loading && !error && (
                  <div className="prose max-w-none text-foreground/80">
                    <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
                      {selectedSession.conversation_text.split("\n").map((line, idx) => (
                        <p key={idx} className="text-sm mb-2">
                          {line.startsWith("User:") ? (
                            <span className="font-semibold text-blue-700">{line}</span>
                          ) : line.startsWith("Bot:") ? (
                            <span className="font-semibold text-gray-700">{line}</span>
                          ) : (
                            line
                          )}
                        </p>
                      ))}
                    </div>

                    <div className="p-4 bg-pink-100 border border-pink-300 rounded-lg text-center shadow-sm">
                      <div className="text-lg font-medium text-pink-800">
                        🧠 Final PHQ-9 Score: {selectedSession.total_score}
                      </div>
                      <div className="text-md text-pink-700 mt-1">
                        Severity Level: {selectedSession.severity_band}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Session ID: {selectedSession.session_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        Recorded at: {new Date(selectedSession.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">🧾 Transcript History</h2>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Loading transcripts...
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 font-medium">
                    ⚠️ {error}
                  </div>
                )}

                {!loading && !error && filteredSessions.length === 0 && (
                  <div className="text-gray-500 italic">
                    No saved transcripts or matches found.
                  </div>
                )}

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                  {filteredSessions.map((s) => (
                    <Card
                      key={s._id}
                      className="p-6 bg-primary-foreground/70 border hover:border-blue-400 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Session {s.session_id.slice(0, 8)}...
                          </h3>
                          <p className="text-sm text-gray-600">
                            Recorded: {new Date(s.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <FileText className="text-blue-500" />
                      </div>

                      <div className="mt-4">
                        <p className="text-sm">Messages: {s.message_count ?? 0}</p>
                        <p className="text-sm">
                          Score:{" "}
                          <span className="font-semibold text-blue-700">{s.total_score}</span>{" "}
                          ({s.severity_band})
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => fetchSessionDetail(s.session_id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(s.session_id, "pdf")}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Transcript;
