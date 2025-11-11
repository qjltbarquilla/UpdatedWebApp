import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/* ===== Types ===== */
interface SessionSummary {
  _id: string;
  session_id: string;
  timestamp: string;
  total_score: number;
  severity_band: string;
  message_count: number;

  emotion_label?: string;
  emotion_confidence?: number;
}

interface SessionAnalysis {
  session_id: string;
  timestamp: string;
  conversation_text: string;
  total_score: number;
  severity_band: string;

  started_at?: string;
  ended_at?: string;

  // optional fields from backend
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  emotion_label?: string;
  emotion_confidence?: number;
}

const formatPhilippineTime = (iso?: string) => {
  if (!iso) return "N/A";

  // Ensure the string is treated as UTC if it has no timezone info
  const value = iso.endsWith("Z") ? iso : iso + "Z";
  const d = new Date(value);

  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Transcript = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { patientName?: string } | null;

  // initialize from navigation state
  const [patientName, setPatientName] = useState<string>(
    navState?.patientName ?? ""
  );

  // Data state
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Header state
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  /* ===== Fetch patient name for sidebar ===== */
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;

      const usernameFromStorage = localStorage.getItem("username");
      if (!usernameFromStorage) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/patients/${patientId}?ownerUsername=${encodeURIComponent(
            usernameFromStorage
          )}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Failed to fetch patient in Transcript:", data);
          return;
        }

        setPatientName((prev) => prev || data.name || "");
      } catch (err) {
        console.error("❌ Error fetching patient in Transcript:", err);
      }
    };

    fetchPatient();
  }, [patientId]);

  /* ===== Username for header ===== */
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

  /* ===== Load sessions list (filtered per user + patient) ===== */
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const usernameFromStorage = localStorage.getItem("username");
        if (!usernameFromStorage || !patientId) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          ownerUsername: usernameFromStorage,
          patientId: patientId,
        });

        const response = await fetch(
          `http://localhost:8000/get-sessions?${params.toString()}`
        );

        if (!response.ok) throw new Error("Failed to fetch sessions");

        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [patientId]);

  /* ===== Load single session detail ===== */
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

  const filteredSessions = sessions.filter(
    (s) =>
      s.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.severity_band.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ===== Confirm delete (called from AlertDialog) ===== */
  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      const res = await fetch(
        `http://localhost:8000/delete-session/${sessionToDelete}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        let msg = "Failed to delete session.";
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
        } catch {}
        alert(msg);
        return;
      }

      alert("✅ Session deleted successfully.");

      // Remove from list
      setSessions((prev) =>
        prev.filter((s) => s.session_id !== sessionToDelete)
      );

      // Close detail view
      setSelectedSession(null);
    } catch (err) {
      console.error("❌ Error deleting session:", err);
      alert("An error occurred while deleting the session.");
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  /* ===== UI ===== */
  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        selectedPatient={
          patientId && patientName
            ? { id: patientId, name: patientName }
            : undefined
        }
      />

      <main className="flex-1 bg-background">
        <div className="p-4 md:p-8">
          {/* Top bar */}
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

          {/* Popovers */}
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
                  <div className="flex gap-3 items-center">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setSelectedSession(null)}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to History
                    </Button>

                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                      onClick={() =>
                        handleDownload(selectedSession.session_id, "pdf")
                      }
                    >
                      <Download className="h-4 w-4" /> PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() =>
                        handleDownload(selectedSession.session_id, "json")
                      }
                    >
                      <FileText className="h-4 w-4" /> JSON
                    </Button>

                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      onClick={() => {
                        setSessionToDelete(selectedSession.session_id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      🗑️ Delete
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
                      {selectedSession.conversation_text
                        .split("\n")
                        .map((line, idx) => (
                          <p key={idx} className="text-sm mb-2">
                            {line.startsWith("User:") ? (
                              <span className="font-semibold text-blue-700">
                                {line}
                              </span>
                            ) : line.startsWith("Bot:") ? (
                              <span className="font-semibold text-gray-700">
                                {line}
                              </span>
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

                      {/* patient info */}
                      <div className="mt-3 text-sm text-pink-900">
                        {selectedSession.patientName && (
                          <div>
                            <span className="font-semibold">Patient:</span>{" "}
                            {selectedSession.patientName}
                            {selectedSession.patientAge &&
                              `, ${selectedSession.patientAge} yrs`}
                            {selectedSession.patientGender &&
                              ` • ${selectedSession.patientGender}`}
                          </div>
                        )}
                      </div>

                      {/* emotion snapshot */}
                      {(selectedSession.emotion_label ||
                        selectedSession.emotion_confidence != null) && (
                        <div className="mt-2 text-sm text-pink-900">
                          <span className="font-semibold">
                            Emotion Snapshot:
                          </span>{" "}
                          {selectedSession.emotion_label || "N/A"}
                          {selectedSession.emotion_confidence != null &&
                            ` (${selectedSession.emotion_confidence.toFixed(
                              0
                            )}% confidence)`}
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mt-3">
                        Session ID: {selectedSession.session_id}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedSession.started_at &&
                        selectedSession.ended_at ? (
                          <>
                            Session time:{" "}
                            {formatPhilippineTime(
                              selectedSession.started_at
                            )}{" "}
                            –{" "}
                            {formatPhilippineTime(
                              selectedSession.ended_at
                            )}
                          </>
                        ) : (
                          <>Recorded at: {formatPhilippineTime(selectedSession.timestamp)}</>
                        )}
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
                            Recorded: {formatPhilippineTime(s.timestamp)}
                          </p>
                        </div>
                        <FileText className="text-blue-500" />
                      </div>

                      <div className="mt-4">
                        <p className="text-sm">
                          Messages: {s.message_count ?? 0}
                        </p>
                        <p className="text-sm">
                          Score:{" "}
                          <span className="font-semibold text-blue-700">
                            {s.total_score}
                          </span>{" "}
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
                          onClick={() =>
                            handleDownload(s.session_id, "pdf")
                          }
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-primary-foreground border border-red-600">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This transcript and its PHQ-9 summary will be permanently removed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSessionToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transcript;
