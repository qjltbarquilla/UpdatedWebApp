from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
from torchvision import transforms
from emotion_cnn import EmotionCNN
import torch.nn.functional as F

app = FastAPI()

# Allow CORS from your frontend
origins = ["http://localhost:8080", "http://localhost:880"]  # adjust if needed

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model once on startup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = EmotionCNN(num_classes=7)
model.load_state_dict(torch.load("facial_expression_model_epoch100.pth", map_location=device))
model.to(device)
model.eval()

class_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

transform = transforms.Compose([
    transforms.Grayscale(),
    transforms.Resize((48, 48)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

@app.post("/predict_emotion")
async def predict_emotion(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("L")

    input_tensor = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(input_tensor)
        _, predicted = torch.max(output, 1)
        emotion = class_labels[predicted.item()]

    return {"emotion": emotion}

@app.get("/")
def root():
    return {"message": "Facial Emotion Recognition API is up"}
