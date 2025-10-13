import torch
import torch.nn as nn
from transformers import AutoModel

class MentalBERT_LSTM(nn.Module):
    def __init__(self, num_questions=9, num_severity_levels=4):
        super(MentalBERT_LSTM, self).__init__()
        self.bert = AutoModel.from_pretrained("microsoft/deberta-v3-small")
        self.lstm = nn.LSTM(input_size=768, hidden_size=256, batch_first=True, bidirectional=True)
        self.fc_question = nn.Linear(256 * 2, num_questions)  # For question_id
        self.fc_severity = nn.Linear(256 * 2, num_severity_levels)  # For severity

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        last_hidden_state = outputs.last_hidden_state
        lstm_out, _ = self.lstm(last_hidden_state)
        pooled = lstm_out[:, -1, :]
        question_logits = self.fc_question(pooled)
        severity_logits = self.fc_severity(pooled)
        return question_logits, severity_logits  # Return predictions for both tasks