//EmotionalAnalysis.tsx

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User, Smile, Frown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Lucide icons are React components
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

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

const EmotionalAnalysis = () => {
  const { patientId } = useParams();

  // header state (like Dashboard)
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

  // webcam + emotion
  const webcamRef = useRef<Webcam | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveEmotion, setLiveEmotion] = useState<string>("Neutral");

  // bars (static for now; keep state if you’ll update them)
  const [emotionalBars] = useState(defaultBars);

  // enumerate cameras (safer version from second code)
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

  // helper: base64 to Blob (from first, compatible with second)
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
      const pretty = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      setLiveEmotion(pretty);
    } catch (err) {
      console.error("Emotion prediction error:", err);
    }
  };

  // polling (safer deps like second code)
  useEffect(() => {
    if (!cameraEnabled || cameraError) return;
    const id = setInterval(captureAndSend, 2000);
    return () => clearInterval(id);
    // deviceId in deps so it rebinds when camera changes
  }, [deviceId, cameraEnabled, cameraError]);

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar selectedPatient={{ id: patientId || "", name: "Hinako" }} />

      <main className="flex-1 bg-background">
        <div className="p-8">
          {/* Header (keep UI from first file) */}
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

          {/* Camera + live emotion (UI from first file, logic from second integrated) */}
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Live Camera & Emotion</h3>

            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              <div className="flex-1">
                <label htmlFor="cameraSelect" className="block font-semibold mb-2">
                  Select Camera
                </label>
                <select
                  id="cameraSelect"
                  className="mb-4 p-2 border rounded w-full md:w-auto"
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

                <div className="mb-4">
                  <Button onClick={() => setCameraEnabled((v) => !v)} variant="outline" size="sm">
                    {cameraEnabled ? "Disable" : "Enable"} Camera
                  </Button>
                </div>

                {/* Safe conditional rendering like the second code */}
                {cameraError ? (
                  <div className="p-6 text-center text-muted-foreground bg-muted rounded-lg">
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
                    {cameraEnabled ? "Loading camera..." : "Camera disabled. Enable to resume."}
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-0">
                <div className="text-lg font-bold">Live Emotion:</div>
                <div className="mt-1 inline-flex items-center gap-2 text-base">
                  {(() => {
                    const Icon = emotionIcons[liveEmotion] || Meh;
                    return <Icon className="h-5 w-5 text-muted-foreground" />;
                  })()}
                  <span>{liveEmotion}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Existing layout from first file */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Emotional State Analysis</h2>
                <div className="space-y-6">
                  {emotionalBars.map((item, idx) => {
                    const Icon = item.icon || emotionIcons[item.emotion] || Smile;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{item.emotion}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 bg-muted/50">
                <h3 className="text-xl font-bold mb-4">Facial Expression Timeline</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Macroexpression analysis captured during conversation sessions,
                  showing emotional patterns over time.
                </p>
                <div className="bg-background/50 p-8 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    Timeline visualization will be displayed here based on captured facial expression data
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
                  The emotional analysis shows a mixed emotional state with predominant positive affect,
                  balanced by periods of sadness and anxiety. This data complements the PHQ-9 screening
                  results and provides additional behavioral context for clinical assessment.
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
