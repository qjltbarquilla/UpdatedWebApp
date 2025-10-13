import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionAnalysis {
  session_id: string;
  timestamp: string;
  conversation_text: string;
  total_score: number;
  severity_band: string;
}

const Transcript = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [transcriptData, setTranscriptData] = useState<SessionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!patientId) return;
      try {
        const response = await fetch(`http://localhost:8000/get-session/${patientId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Transcript not found for this session.");
          }
          throw new Error(`Failed to fetch transcript for ${patientId}`);
        }
        const data = await response.json();
        setTranscriptData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [patientId]);

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        selectedPatient={{ id: patientId || "", name: "Hinako" }}
      />

      <main className="flex-1 bg-background">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search transcript..." className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Transcript Card */}
          <Card className="p-8 min-h-[600px] bg-muted/50 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Conversation Transcript
              </h2>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate("/transcripts")}
              >
                <ArrowLeft className="h-4 w-4" /> Back to History
              </Button>
            </div>

            {loading && (
              <p className="text-gray-500 italic">Loading transcript...</p>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 font-medium">
                ⚠️ {error}
                <div className="mt-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/transcripts")}
                    className="text-sm"
                  >
                    Return to History
                  </Button>
                </div>
              </div>
            )}

            {transcriptData && (
              <div className="prose max-w-none text-foreground/80">
                <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
                  {transcriptData.conversation_text
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
                    🧠 Final PHQ-9 Score: {transcriptData.total_score}
                  </div>
                  <div className="text-md text-pink-700 mt-1">
                    Severity Level: {transcriptData.severity_band}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Session ID: {transcriptData.session_id}
                  </div>
                  <div className="text-xs text-gray-400">
                    Recorded at:{" "}
                    {new Date(transcriptData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && !transcriptData && (
              <div className="text-gray-500 italic">
                No transcript found for this session.
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

