import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User, Smile, Frown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";


const emotionIcons = {
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


const EmotionalAnalysis = () => {
  const { patientId } = useParams();
  const webcamRef = useRef(null);
  const [liveEmotion, setLiveEmotion] = useState("Neutral");
  const [emotionalData, setEmotionalData] = useState([
    { emotion: "Happy", percentage: 35, color: "bg-primary", icon: Smile },
    { emotion: "Sad", percentage: 25, color: "bg-accent", icon: Frown },
    { emotion: "Neutral", percentage: 20, color: "bg-secondary", icon: Meh },
    { emotion: "Anxious", percentage: 15, color: "bg-destructive", icon: Frown },
    { emotion: "Calm", percentage: 5, color: "bg-primary/50", icon: Smile },
  ]);
  
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(true);  // Camera enabled state


  // Enumerate cameras on component mount
  useEffect(() => {
    async function getVideoDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) setDeviceId(videoDevices[0].deviceId);
      } catch (e) {
        console.error("Error fetching video devices", e);
      }
    }
    getVideoDevices();
  }, []);


  // Convert base64 image to Blob for upload
  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/jpeg" });
  };


  const captureAndSend = async () => {
    if (!cameraEnabled) return;  // Don't capture if camera disabled

    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    const imageBlob = base64ToBlob(screenshot);

    const formData = new FormData();
    formData.append("file", imageBlob, "capture.jpg");

    try {
      const response = await fetch("http://localhost:880/predict_emotion", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        console.error("Failed to fetch emotion:", response.statusText);
        return;
      }
      const data = await response.json();
      const emotionLabel = data.emotion.charAt(0).toUpperCase() + data.emotion.slice(1);
      setLiveEmotion(emotionLabel);
    } catch (error) {
      console.error("Emotion prediction error:", error);
    }
  };


  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSend();
    }, 2000);
    return () => clearInterval(interval);
  }, [deviceId, cameraEnabled]); // rerun when device or camera toggle changes


  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar selectedPatient={{ id: patientId || "", name: "Hinako" }} />
      <main className="flex-1 bg-background p-8">
        <div className="mb-6">
          <label htmlFor="cameraSelect" className="block font-semibold mb-2">
            Select Camera
          </label>
          <select
            id="cameraSelect"
            className="mb-4 p-2 border rounded"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            disabled={!cameraEnabled}  // disable dropdown if camera disabled
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>

          <div className="mb-4">
            <Button onClick={() => setCameraEnabled(!cameraEnabled)} variant="outline" size="sm">
              {cameraEnabled ? "Disable" : "Enable"} Camera
            </Button>
          </div>

          {cameraEnabled && (
            <Webcam
              audio={false}
              height={200}
              width={200}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ deviceId: deviceId ? { exact: deviceId } : undefined }}
            />
          )}

          <div className="mt-2 font-bold text-lg">Live Emotion: {liveEmotion}</div>
        </div>

        {/* Your existing UI below unchanged */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Emotional State Analysis</h2>
              <div className="space-y-6">
                {emotionalData.map((item, index) => {
                  const Icon = item.icon || emotionIcons[item.emotion] || Smile;
                  return (
                    <div key={index}>
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
                The emotional analysis shows a mixed emotional state with
                predominant positive affect, balanced by periods of sadness and anxiety.
                This data complements the PHQ-9 screening results and provides additional behavioral context for clinical assessment.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};


export default EmotionalAnalysis;
