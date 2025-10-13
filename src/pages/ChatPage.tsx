import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Mic, MicOff, Send, StopCircle } from "lucide-react";

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

type Message = {
  from: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  /* ---------- NEW: read patientId for sidebar chevron ---------- */
  const { patientId } = useParams<{ patientId: string }>();
  // fallback so the chevron still appears even if there’s no URL param
  const selectedPatient = {
    id: patientId || "session",
    name: "Hinako", // replace with real name if you have it
  };

  // ---------------- existing state (unchanged)
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [conversationStopped, setConversationStopped] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<{ score: number; band: string } | null>(null);

  // ---------------- shell/ui state
  const [username, setUsername] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  // ---------------- refs (unchanged)
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedFinalTranscript = useRef<string>("");

  // auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // username from localStorage (to match your dashboard header)
  useEffect(() => {
    const u = localStorage.getItem("username");
    if (u) setUsername(u);
  }, []);

  // speech setup (unchanged)
  useEffect(() => {
    if (!SpeechRecognition) {
      alert("SpeechRecognition API is not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscriptPart = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscriptPart += part;
        else interimTranscript += part;
      }

      if (interimTranscript) {
        setChatLog((prev) => [
          ...prev.slice(0, -1),
          { from: "user", text: "[...]" + interimTranscript },
        ]);
        setInputText(interimTranscript.trim());
      }

      if (finalTranscriptPart) {
        accumulatedFinalTranscript.current += finalTranscriptPart + " ";
        if (finalTranscriptTimer.current) clearTimeout(finalTranscriptTimer.current);
        finalTranscriptTimer.current = setTimeout(() => {
          const finalText = accumulatedFinalTranscript.current.trim();
          accumulatedFinalTranscript.current = "";
          handleFinalTranscript(finalText);
        }, 1500);
      }
    };

    recognitionRef.current.onend = () => setListening(false);
  }, []);

  async function handleFinalTranscript(finalText: string) {
    if (!finalText) return;
    setChatLog((prev) => [...prev, { from: "user", text: finalText }]);
    setTranscript((prev) => [...prev, finalText]);
    await sendMessage(finalText);
  }

  function toggleListening() {
    if (!recognitionRef.current || conversationStopped) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInputText("");
      recognitionRef.current.start();
      setListening(true);
    }
  }

  async function sendMessage(text?: string) {
    const message = text ?? inputText.trim();
    if (!message || conversationStopped) return;

    setChatLog((prev) => [...prev, { from: "user", text: message }]);
    setTranscript((prev) => [...prev, message]);
    setInputText("");

    const url = sessionId
      ? `http://localhost:8000/predict?session_id=${sessionId}`
      : "http://localhost:8000/predict";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });

      const data = await response.json();
      if (!sessionId && data.session_id) setSessionId(data.session_id);

      const botMessage =
        data.bot_message ||
        `Mapped to PHQ-9 question ${data.question_id + 1} with severity ${data.severity}`;

      setChatLog((prev) => [...prev, { from: "bot", text: botMessage }]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { from: "bot", text: "Error: Unable to contact backend." },
      ]);
    }
  }

  async function stopConversation() {
    if (!sessionId || conversationStopped) return;
    try {
      const response = await fetch(`http://localhost:8000/stop-session/${sessionId}`, {
        method: "POST",
      });
      const data = await response.json();

      setChatLog((prev) => [...prev, { from: "bot", text: data.message }]);

      if (data.severity_band) {
        setFinalResult({ score: data.total_score, band: data.severity_band });
      }

      setConversationStopped(true);
    } catch (err) {
      console.error("Error stopping conversation:", err);
      setChatLog((prev) => [
        ...prev,
        { from: "bot", text: "Error stopping conversation." },
      ]);
    }
  }

  // header popovers (match dashboard)
  const handleNotificationClick = () => {
    setShowNotifications(true);
    setTimeout(() => setShowNotifications(false), 2000);
  };
  const handleUserIconClick = () => {
    setShowUserInfo(true);
    setTimeout(() => setShowUserInfo(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* left panel with chevron-open patient section */}
      <DashboardSidebar selectedPatient={selectedPatient} />

      {/* main */}
      <main className="flex-1 bg-dashboard w-full">
        <div className="p-4 md:p-8">
          {/* top bar (search + icons) */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input
                  placeholder="Search"
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

          {/* popovers */}
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
              <p className="text-sm">Welcome!</p>
            </div>
          )}

          {/* chat card */}
          <Card className="p-6 bg-sidebar/20 rounded-2xl border-none shadow-sm">
            <h2
              className="text-3xl font-bold mb-4 text-primary"
              style={{ fontFamily: "Alef, sans serif" }}
            >
              Conversation
            </h2>

            <div className="h-[56vh] overflow-y-auto rounded-xl bg-background border px-4 py-4">
              {chatLog.map((msg, idx) => (
                <div key={idx} className={`mb-3 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2 shadow-sm ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-sidebar/40 text-primary"
                    }`}
                  >
                    <span className="text-sm whitespace-pre-line">{msg.text}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* final result summary */}
            {finalResult && (
              <div className="mt-4 p-4 bg-accent/20 border border-accent rounded-xl text-center">
                <div className="text-lg font-semibold text-primary">
                  🧠 Final PHQ-9 Score: {finalResult.score}
                </div>
                <div className="text-sm text-primary/80 mt-1">Severity Level: {finalResult.band}</div>
              </div>
            )}

            {/* composer */}
            <div className="mt-4 flex gap-2 items-center">
              <Input
                placeholder="Type your message..."
                className="flex-1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={conversationStopped}
              />
              <Button onClick={() => sendMessage()} disabled={conversationStopped} className="gap-2">
                <Send className="h-4 w-4" /> Send
              </Button>
              <Button onClick={toggleListening} disabled={conversationStopped} className="gap-2">
                {listening ? (
                  <>
                    <MicOff className="h-4 w-4" /> Stop Mic
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" /> Start Mic
                  </>
                )}
              </Button>
              <Button
                onClick={stopConversation}
                disabled={conversationStopped}
                variant="secondary"
                className="gap-2"
              >
                <StopCircle className="h-4 w-4" />
                {conversationStopped ? "Conversation Stopped" : "Stop Conversation"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
