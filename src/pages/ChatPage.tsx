//ChatPage.tsx

import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Mic, MicOff, Send, StopCircle } from "lucide-react";
import Webcam from "react-webcam";
import { Smile, Frown, Meh } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

type Message = {
  from: "user" | "bot";
  text: string;
};

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type PatientInfo = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
};

const emotionIcons: Record<string, IconType> = {
  Happy: Smile,
  Sad: Frown,
  Neutral: Meh,
  Anxious: Frown,
  Calm: Smile,
  Angry: Frown,
  Disgust: Frown,
  Fear: Frown,
  Surprise: Smile,
};

const defaultBars = [
  { emotion: "Happy", percentage: 35, color: "bg-primary", icon: Smile },
  { emotion: "Sad", percentage: 25, color: "bg-accent", icon: Frown },
  { emotion: "Neutral", percentage: 20, color: "bg-secondary", icon: Meh },
  { emotion: "Anxious", percentage: 15, color: "bg-destructive", icon: Frown },
  { emotion: "Calm", percentage: 5, color: "bg-primary/50", icon: Smile },
];


export default function ChatPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const navState = location.state as { patientName?: string } | null;

  // 👇 initialize with name from navigation (no flicker)
  const [patientName, setPatientName] = useState<string>(
    navState?.patientName ?? ""
  );

  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);


  
  const selectedPatient =
  patientId && patientName
    ? { id: patientId, name: patientName }
    : undefined;



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

    // ---------------- emotion / webcam state (from EmotionalAnalysis)
  const webcamRef = useRef<Webcam | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  //const [liveEmotion, setLiveEmotion] = useState<string>("Neutral");
  const [liveEmotion, setLiveEmotion] = useState<string>("Neutral");

const [emotionSnapshot, setEmotionSnapshot] = useState<{
  emotion: string;
  confidence: number;
} | null>(null);


  // ---------------- refs (unchanged)
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedFinalTranscript = useRef<string>("");

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
        console.error("❌ Failed to fetch patient in ChatPage:", data);
        return;
      }

      // name (avoid flicker)
      setPatientName((prev) => prev || data.name || "");

      // full patient info (assuming your Node API returns name, age, gender)
      setPatientInfo({
        id: patientId,
        name: data.name,
        age: data.age,
        gender: data.gender,
      });
    } catch (err) {
      console.error("❌ Error fetching patient in ChatPage:", err);
    }
  };

  fetchPatient();
}, [patientId]);



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

    // enumerate cameras
  useEffect(() => {
    (async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          setCameraError("This browser does not support media device enumeration.");
          return;
        }
        const all = await navigator.mediaDevices.enumerateDevices();
        const video = all.filter((d) => d.kind === "videoinput") as MediaDeviceInfo[];
        setDevices(video);
        if (video.length > 0) {
          setDeviceId(video[0].deviceId);
          setCameraError(null);
        } else {
          setCameraError("No camera detected. Please connect a webcam.");
        }
      } catch (e) {
        console.error("Error fetching video devices", e);
        setCameraError("Unable to access camera. Permission denied or unsupported browser.");
      }
    })();
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

  // 🔹 attach who + which patient
  const payload: any = { text: message };
  if (patientId) payload.patientId = patientId;
  if (username) payload.ownerUsername = username;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ /predict error:", response.status, text);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!sessionId && data.session_id) setSessionId(data.session_id);

    const botMessage =
      data.bot_message ||
      `Mapped to PHQ-9 question ${data.question_id + 1} with severity ${data.severity}`;

    setChatLog((prev) => [...prev, { from: "bot", text: botMessage }]);
  } catch (err) {
    console.error("❌ Chat backend error:", err);
    setChatLog((prev) => [
      ...prev,
      { from: "bot", text: "Error: Unable to contact backend." },
    ]);
  }
}


  async function stopConversation() {
  if (!sessionId || conversationStopped) return;

  try {
    const response = await fetch(
  `http://localhost:8000/stop-session/${sessionId}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerUsername: username,
      patientId: patientId,
      patientName: patientInfo?.name,
      patientAge: patientInfo?.age,
      patientGender: patientInfo?.gender,
      emotion: emotionSnapshot?.emotion,
      emotionConfidence: emotionSnapshot?.confidence,
    }),
  }
);


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

    const base64ToBlob = (base64: string) => {
    const parts = base64.split(",");
    const byteString = atob(parts[1] || "");
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: "image/jpeg" });
  };

  const captureAndSend = async () => {
    if (!cameraEnabled || !webcamRef.current || cameraError) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    const imageBlob = base64ToBlob(screenshot);
    const formData = new FormData();
    formData.append("file", imageBlob, "capture.jpg");

    try {
      const res = await fetch("http://localhost:880/predict_emotion", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        console.error("Failed to fetch emotion:", res.statusText);
        return;
      }
      const data = await res.json();

const raw = String(data?.emotion ?? "Neutral");
const pretty =
  raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

// 👇 if backend ever returns confidence, use it; otherwise default to 100
const confidence =
  typeof data?.confidence === "number" ? data.confidence : 100;

setLiveEmotion(pretty);
setEmotionSnapshot({
  emotion: pretty,
  confidence,
});

    } catch (err) {
      console.error("Emotion prediction error:", err);
    }
  };

    useEffect(() => {
    if (!cameraEnabled || cameraError) return;
    const id = setInterval(captureAndSend, 2000); // capture every 2s
    return () => clearInterval(id);
  }, [deviceId, cameraEnabled, cameraError]);


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
                    {/* MAIN GRID: Chat + Emotion side by side */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT: Conversation (take 2/3 width) */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-sidebar/20 rounded-2xl border-none shadow-sm">
                <h2
                  className="text-3xl font-bold mb-4 text-primary"
                  style={{ fontFamily: "Alef, sans serif" }}
                >
                  Conversation
                </h2>

                <div className="h-[56vh] overflow-y-auto rounded-xl bg-background border px-4 py-4">
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-3 flex ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2 shadow-sm ${
                          msg.from === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-sidebar/40 text-primary"
                        }`}
                      >
                        <span className="text-sm whitespace-pre-line">
                          {msg.text}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {finalResult && (
                  <div className="mt-4 p-4 bg-accent/20 border border-accent rounded-xl text-center">
                    <div className="text-lg font-semibold text-primary">
                      🧠 Final PHQ-9 Score: {finalResult.score}
                    </div>
                    <div className="text-sm text-primary/80 mt-1">
                      Severity Level: {finalResult.band}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2 items-center">
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={conversationStopped}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={conversationStopped}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" /> Send
                  </Button>
                  <Button
                    onClick={toggleListening}
                    disabled={conversationStopped}
                    className="gap-2"
                  >
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
                    {conversationStopped
                      ? "Conversation Stopped"
                      : "Stop Conversation"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* RIGHT: Live Camera + Emotion */}
            <div className="space-y-6">
              <Card className="p-6 bg-sidebar/20 rounded-2xl border-none shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  Live Camera & Emotion
                </h3>

                <div className="flex flex-col items-center gap-4">
                  {cameraError ? (
                    <div className="p-4 text-center text-muted-foreground bg-muted rounded-lg">
                      {cameraError}
                    </div>
                  ) : cameraEnabled && devices.length > 0 ? (
                    <Webcam
                      audio={false}
                      height={200}
                      width={200}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        deviceId: deviceId ? { exact: deviceId } : undefined,
                      }}
                    />
                  ) : (
                    <div className="p-6 text-center text-primary-foreground bg-muted rounded-lg">
                      {cameraEnabled
                        ? "Loading camera..."
                        : "Camera disabled. Enable to resume."}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-1">
                    <div className="text-lg font-bold">Live Emotion</div>
                    <div className="flex items-center gap-2 text-base">
                      {(() => {
                        const Icon = emotionIcons[liveEmotion] || Meh;
                        return (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        );
                      })()}
                      <span>{liveEmotion}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={() =>
                        setCameraEnabled((prev) => !prev)
                      }
                      variant="outline"
                      size="sm"
                    >
                      {cameraEnabled ? "Disable Camera" : "Enable Camera"}
                    </Button>
                    <label
                      htmlFor="cameraSelect"
                      className="block text-xs font-semibold"
                    >
                      Select Camera
                    </label>
                    <select
                      id="cameraSelect"
                      className="p-2 border rounded w-full text-xs"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      disabled={!cameraEnabled || !!cameraError}
                    >
                      {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
  <h2 className="text-2xl font-bold mb-6">Emotional State Analysis</h2>

  {emotionSnapshot ? (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {(() => {
            const Icon =
              emotionIcons[emotionSnapshot.emotion] || Smile;
            return (
              <Icon className="h-5 w-5 text-muted-foreground" />
            );
          })()}
          <span className="font-semibold">
            {emotionSnapshot.emotion}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {emotionSnapshot.confidence.toFixed(0)}%
        </span>
      </div>

      <Progress
        value={emotionSnapshot.confidence}
        className="h-3"
      />

      <p className="text-xs text-muted-foreground">
        Latest detected emotional state with model confidence.
      </p>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">
      No emotion snapshot yet. Once the camera detects a face,
      the most recent emotion and its confidence will appear here.
    </p>
  )}
</Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
