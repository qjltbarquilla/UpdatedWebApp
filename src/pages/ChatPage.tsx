import React, { useState, useRef, useEffect } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

type Message = {
  from: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [conversationStopped, setConversationStopped] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<{
    score: number;
    band: string;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptTimer = useRef<NodeJS.Timeout | null>(null);
  const accumulatedFinalTranscript = useRef<string>("");

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // Setup SpeechRecognition
  useEffect(() => {
    if (!SpeechRecognition) {
      alert("SpeechRecognition API is not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscriptPart = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscriptPart += part;
        else interimTranscript += part;
      }

      // Show interim speech text
      if (interimTranscript) {
        setChatLog((prev) => [
          ...prev.slice(0, -1),
          { from: "user", text: "[...]" + interimTranscript },
        ]);
        setInputText(interimTranscript.trim());
      }

      // Process after pause in speech
      if (finalTranscriptPart) {
        accumulatedFinalTranscript.current += finalTranscriptPart + " ";
        if (finalTranscriptTimer.current)
          clearTimeout(finalTranscriptTimer.current);
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

    // ✅ Add user message IMMEDIATELY (before sending to backend)
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
      const response = await fetch(
        `http://localhost:8000/stop-session/${sessionId}`,
        { method: "POST" }
      );
      const data = await response.json();

      setChatLog((prev) => [...prev, { from: "bot", text: data.message }]);

      if (data.severity_band) {
        // ✅ Save final summary separately
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

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col h-[85vh] border rounded shadow bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Conversation
      </h2>

      <div className="flex-1 overflow-y-auto border p-4 rounded mb-4 bg-white">
        {chatLog.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 max-w-[80%] ${
              msg.from === "user" ? "ml-auto bg-blue-100" : "mr-auto bg-gray-200"
            } rounded px-3 py-2`}
          >
            <span className="text-sm whitespace-pre-line">{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ✅ Final Result Summary Card */}
      {finalResult && (
        <div className="p-4 mb-3 bg-pink-100 border border-pink-300 rounded-lg text-center shadow-sm">
          <div className="text-lg font-medium text-pink-800">
            🧠 Final PHQ-9 Score: {finalResult.score}
          </div>
          <div className="text-md text-pink-700 mt-1">
            Severity Level: {finalResult.band}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2 focus:outline-blue-500"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={conversationStopped}
        />
        <button
          onClick={() => sendMessage()}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          disabled={conversationStopped}
        >
          Send
        </button>
        <button
          onClick={toggleListening}
          className={`px-4 rounded ${
            listening ? "bg-red-600" : "bg-green-600"
          } text-white`}
          disabled={conversationStopped}
        >
          {listening ? "Stop Mic" : "Start Mic"}
        </button>
        <button
          onClick={stopConversation}
          className="bg-gray-600 text-white px-4 rounded hover:bg-gray-700"
          disabled={conversationStopped}
        >
          {conversationStopped ? "Conversation Stopped" : "Stop Conversation"}
        </button>
      </div>
    </div>
  );
}
