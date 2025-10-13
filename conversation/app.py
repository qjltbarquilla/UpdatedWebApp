from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import torch
from transformers import AutoTokenizer
from mental_model import MentalBERT_LSTM
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import datetime
import json
import random
import uuid
import re
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import os

# === Database Configuration ===
#MONGODB_URL = "mongodb+srv://Dylan:PD123@cluster0.qvy672n.mongodb.net/transcript_db?retryWrites=true&w=majority"
MONGODB_DB = "transcript_db"
MONGODB_URL = "mongodb+srv://Dylan:PD123@cpe025snugglemindcluste.n9hk3mc.mongodb.net/"
app = FastAPI()

origins = ["http://localhost:8080", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === MongoDB Connection Handling ===
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    app.mongodb = app.mongodb_client[MONGODB_DB]
    print("✅ Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    print("🛑 MongoDB connection closed")

# === Save Messages ===
async def save_message(session_id: str, sender: str, text: str, message_type: str = "text"):
    doc = {
        "session_id": session_id,
        "sender": sender,
        "text": text,
        "message_type": message_type,
        "timestamp": datetime.datetime.utcnow()
    }
    result = await app.mongodb["messages"].insert_one(doc)
    return result.inserted_id

# === Load Intents File ===
with open(r"C:\Users\Juniper\Desktop\kid-whisper-vue\conversation\KB.json") as file:
    data = json.load(file)
intents = data["intents"]

def get_intent_response(user_input: str) -> str:
    user_input = user_input.lower()
    fallback_responses = None
    for intent in intents:
        if intent.get("tag") == "no-response":
            fallback_responses = intent.get("responses", [])
            continue
        for pattern in intent.get("patterns", []):
            if pattern.strip() == "":
                continue
            if pattern.lower() in user_input:
                return random.choice(intent.get("responses", ["I'm here to listen."]))
    if fallback_responses:
        return random.choice(fallback_responses)
    return "I'm here to listen. Please go on..."

# === Model Setup ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained("microsoft/deberta-v3-small")
model = MentalBERT_LSTM(num_questions=9, num_severity_levels=4)
model.load_state_dict(torch.load("model_weights.pth", map_location=device))
model.to(device)
model.eval()

# === Data Models ===
class UserInput(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    question_id: int
    severity: int
    bot_message: Optional[str]
    session_id: str

class FullTextInput(BaseModel):
    full_text: str

class MappedResult(BaseModel):
    sentence: str
    question_id: int
    severity: int

class FullPredictionResponse(BaseModel):
    mapped_results: list[MappedResult]

# === Track Closed Sessions (in-memory) ===
closed_sessions = set()

# === Predict Endpoint (Creates and Tracks Session) ===
@app.post("/predict", response_model=PredictionResponse)
async def predict_phq9(user_input: UserInput, session_id: Optional[str] = Query(None)):
    """Main prediction route; auto-creates session if not provided."""
    if not session_id or session_id == "default_session":
        session_id = str(uuid.uuid4())
        print(f"🆕 New session created: {session_id}")

    await save_message(session_id, "user", user_input.text)

    inputs = tokenizer(
        user_input.text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    with torch.no_grad():
        question_logits, severity_logits = model(input_ids, attention_mask)
        question_id = torch.argmax(question_logits, dim=1).item()
        severity = torch.argmax(severity_logits, dim=1).item()

    bot_message = get_intent_response(user_input.text)
    await save_message(session_id, "bot", bot_message)

    return PredictionResponse(
        question_id=question_id,
        severity=severity,
        bot_message=bot_message,
        session_id=session_id  # 🔥 return session_id so frontend keeps it
    )

# === Stop Session + Auto Analysis ===
@app.post("/stop-session/{session_id}")
async def stop_session(session_id: str):
    if session_id in closed_sessions:
        return {"message": f"Session {session_id} was already stopped earlier."}

    closed_sessions.add(session_id)

    cursor = app.mongodb["messages"].find({"session_id": session_id}).sort("timestamp", 1)
    all_messages = await cursor.to_list(length=None)

    if not all_messages:
        print(f"⚠️ No messages found for {session_id}")
        return {"message": f"No messages found for session {session_id}."}

    conversation_text = "\n".join([f"{msg['sender'].capitalize()}: {msg['text']}" for msg in all_messages])

    user_text = " ".join([msg["text"] for msg in all_messages if msg["sender"] == "user"])
    sentences = [s.strip() for s in user_text.split('.') if s.strip()]

    mapped_results, tally = [], {}

    for sentence in sentences:
        inputs = tokenizer(
            sentence,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128,
        )
        input_ids = inputs["input_ids"].to(device)
        attention_mask = inputs["attention_mask"].to(device)

        with torch.no_grad():
            question_logits, severity_logits = model(input_ids, attention_mask)
            question_id = torch.argmax(question_logits, dim=1).item()
            severity = torch.argmax(severity_logits, dim=1).item()

        mapped_results.append({
            "sentence": sentence,
            "question_id": question_id,
            "severity": severity
        })
        tally[question_id] = tally.get(question_id, 0) + severity

    total_score = sum(tally.values())

    def get_band(score):
        if score <= 4: return "Minimal"
        elif score <= 9: return "Mild"
        elif score <= 14: return "Moderate"
        elif score <= 19: return "Moderately Severe"
        else: return "Severe"

    severity_band = get_band(total_score)

    summary_doc = {
        "session_id": session_id,
        "timestamp": datetime.datetime.utcnow(),
        "conversation_text": conversation_text,
        "mapped_results": mapped_results,
        "severity_tally": {str(k): v for k, v in tally.items()},
        "total_score": total_score,
        "severity_band": severity_band,
        "message_count": len(all_messages)
    }

    try:
        result = await app.mongodb["session_analysis"].insert_one(summary_doc)
        print(f"✅ Full conversation summary saved with ID: {result.inserted_id}")
    except Exception as e:
        print(f"❌ Error saving conversation summary: {e}")

    return {
        "message": f"Session {session_id} stopped and full conversation saved.",
        "severity_tally": tally,
        "total_score": total_score,
        "severity_band": severity_band,
        "mapped_results": mapped_results
    }

# === Fetch a Single Session (with fallback test ID) ===
@app.get("/get-session/{session_id}")
async def get_session(session_id: str):
    """
    Fetches a real PHQ-9 session document by its session_id.
    Used by PHQ-9, Emotional Analysis, and other real patient pages.
    """
    doc = await app.mongodb["session_analysis"].find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    doc["_id"] = str(doc["_id"])
    if isinstance(doc["timestamp"], datetime.datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()

    return doc
@app.get("/get-transcript-demo")


@app.get("/get-transcript-demo")
async def get_transcript_demo():
    """
    Returns the fixed demo transcript used only by the Transcript page.
    All other routes remain unaffected.
    """
    TEST_SESSION_ID = "f469f0a8-bb2f-4533-b741-9aa118d2e69f"
    doc = await app.mongodb["session_analysis"].find_one({"session_id": TEST_SESSION_ID})

    if not doc:
        raise HTTPException(status_code=404, detail="Demo transcript not found in MongoDB.")

    doc["_id"] = str(doc["_id"])
    if isinstance(doc["timestamp"], datetime.datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()

    return doc




# === Fetch All Sessions (for Transcript Dashboard) ===
@app.get("/get-sessions")
async def get_sessions():
    """
    Returns all saved session summaries (without full conversation)
    for populating the transcript dashboard list.
    """
    cursor = app.mongodb["session_analysis"].find().sort("timestamp", -1)
    sessions = await cursor.to_list(length=100)

    formatted = []
    for doc in sessions:
        formatted.append({
            "_id": str(doc["_id"]),
            "session_id": doc.get("session_id"),
            "timestamp": doc.get("timestamp").isoformat() if isinstance(doc.get("timestamp"), datetime.datetime) else doc.get("timestamp"),
            "total_score": doc.get("total_score", 0),
            "severity_band": doc.get("severity_band", "Unknown"),
            "message_count": doc.get("message_count", 0),
        })

    # ✅ If you have no records yet, return the test one (for display)
    if not formatted:
        formatted = [{
            "_id": "test123",
            "session_id": "f469f0a8-bb2f-4533-b741-9aa118d2e69f",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "total_score": 12,
            "severity_band": "Moderate",
            "message_count": 8,
        }]

    return formatted


# === Generate Session Report (PDF / JSON) ===
@app.get("/generate-report/{session_id}")
async def generate_report(session_id: str, format: str = "pdf"):
    """
    Generates a session summary report in either PDF or JSON format.
    Example:
      /generate-report/1?format=pdf
      /generate-report/f469f0a8...?format=json
    """
    TEST_SESSION_ID = "f469f0a8-bb2f-4533-b741-9aa118d2e69f"
    use_id = TEST_SESSION_ID if session_id == "1" else session_id

    # Fetch document
    doc = await app.mongodb["session_analysis"].find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    # Convert MongoDB types
    doc["_id"] = str(doc["_id"])
    if isinstance(doc["timestamp"], datetime.datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()

    # JSON mode
    if format.lower() == "json":
        print(f"📄 Returning JSON report for session {use_id}")
        return JSONResponse(content=doc)

    # PDF mode
    filename = f"PHQ9_Report_{use_id}.pdf"
    filepath = os.path.join(os.getcwd(), filename)

    pdf = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    content = []

    # Header info
    content.append(Paragraph("<b>PHQ-9 Conversation Summary Report</b>", styles["Title"]))
    content.append(Spacer(1, 12))
    content.append(Paragraph(f"<b>Session ID:</b> {use_id}", styles["Normal"]))
    content.append(Paragraph(f"<b>Date:</b> {doc['timestamp']}", styles["Normal"]))
    content.append(Spacer(1, 12))
    content.append(Paragraph(f"<b>Total PHQ-9 Score:</b> {doc.get('total_score', 'N/A')}", styles["Normal"]))
    content.append(Paragraph(f"<b>Severity Level:</b> {doc.get('severity_band', 'N/A')}", styles["Normal"]))
    content.append(Spacer(1, 12))

    # Placeholder for macroexpression (future feature)
    content.append(Paragraph("<b>Macroexpression Insights:</b>", styles["Heading3"]))
    content.append(Paragraph("No macroexpression data recorded for this session.", styles["Normal"]))
    content.append(Spacer(1, 12))

    # Conversation transcript
    content.append(Paragraph("<b>Conversation Transcript:</b>", styles["Heading3"]))
    for line in doc.get("conversation_text", "").split("\n"):
        if line.startswith("User:"):
            content.append(Paragraph(f"<font color='blue'>{line}</font>", styles["Normal"]))
        elif line.startswith("Bot:"):
            content.append(Paragraph(f"<font color='gray'>{line}</font>", styles["Normal"]))
        else:
            content.append(Paragraph(line, styles["Normal"]))
    content.append(Spacer(1, 12))

    # PHQ-9 mapping table
    mapped = doc.get("mapped_results", [])
    if mapped:
        content.append(Paragraph("<b>PHQ-9 Mappings:</b>", styles["Heading3"]))
        table_data = [["Utterance", "Question ID", "Severity"]]
        for m in mapped:
            table_data.append([
                m["sentence"], f"Q{m['question_id'] + 1}", str(m["severity"])
            ])
        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ]))
        content.append(table)

    pdf.build(content)
    print(f"✅ PDF report generated: {filepath}")

    return FileResponse(filepath, filename=filename, media_type="application/pdf")


# === Root Endpoint ===
@app.get("/")
def root():
    return {"message": "PHQ-9 model backend is alive"}

# === Frontend Redirect Fallback (React Router Safe) ===
'''@app.get("/{full_path:path}", response_class=HTMLResponse)
async def frontend_routes(full_path: str):
    """
    Safe fallback that preserves React Router behavior even after visiting /transcript/:id.
    Does NOT break navigation for other routes.
    """

    # ✅ Let API routes return 404 normally
    if full_path.startswith((
        "predict", "stop-session", "get-session", "get-sessions",
        "get-transcript-demo", "generate-report"
    )):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    # ✅ This keeps React control without breaking history or routes
    return """
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <script>
          // Dynamically redirect only within frontend app context
          const target = window.location.origin;
          window.location.href = target;
        </script>
      </head>
      <body>
        <p>Loading frontend app...</p>
      </body>
    </html>
    """

'''
