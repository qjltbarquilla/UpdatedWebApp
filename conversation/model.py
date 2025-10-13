import torch
import torch.nn.functional as F
from transformers import AutoTokenizer
from mental_model import MentalBERT_LSTM  # Import your model class

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize model
model = MentalBERT_LSTM(num_questions=9, num_severity_levels=4)

# Load model weights
model.load_state_dict(torch.load(r"D:\Anacondork\Activities\PD\backend\model_weights.pth", map_location=device))
model.to(device)
model.eval()

# Load tokenizer (ensure your tokenizer model name matches what you used in training)
tokenizer = AutoTokenizer.from_pretrained("microsoft/deberta-v3-small")


def predict(text, confidence_threshold=0.0):
    # Tokenize input text
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    # Run prediction
    with torch.no_grad():
        question_logits, severity_logits = model(input_ids, attention_mask)

        question_probs = F.softmax(question_logits, dim=1)
        severity_probs = F.softmax(severity_logits, dim=1)

        predicted_question = torch.argmax(question_probs, dim=1).item()
        predicted_severity = torch.argmax(severity_probs, dim=1).item()

        confidence_question = question_probs[0][predicted_question].item()
        confidence_severity = severity_probs[0][predicted_severity].item()

    # Use confidence threshold to filter low-confidence predictions if desired
    if confidence_question < confidence_threshold or confidence_severity < confidence_threshold:
        return None, None

    return predicted_question, predicted_severity
