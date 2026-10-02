import time
from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

# -----------------------------
# Load Model
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.efficientnet_b0(weights=None)
model.classifier[1] = torch.nn.Linear(
    model.classifier[1].in_features,
    2
)

model.load_state_dict(
    torch.load(
        "models/deepfake_model.pth",
        map_location=device
    )
)

model.to(device)
model.eval()

print("Model Loaded Successfully")

# -----------------------------
# Image Transform
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# -----------------------------
# Dataset
# -----------------------------
dataset_path = Path("datasets/test")

real_folder = dataset_path / "real"
fake_folder = dataset_path / "fake"

y_true = []
y_pred = []
y_score = []

total_latency = 0
total_images = 0

# -----------------------------
# Prediction Function
# -----------------------------
def predict_image(image_path):

    image = Image.open(image_path).convert("RGB")

    image = transform(image)

    image = image.unsqueeze(0).to(device)

    start = time.time()

    with torch.no_grad():

        outputs = model(image)

        probs = torch.softmax(outputs, dim=1)

    latency = time.time() - start

    real_prob = probs[0][0].item()

    fake_prob = probs[0][1].item()

    prediction = 0 if real_prob > fake_prob else 1

    return prediction, fake_prob, latency

# -----------------------------
# Evaluate Real Images
# -----------------------------
print("Evaluating REAL images...")

for image in real_folder.iterdir():

    if image.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
        continue

    pred, score, latency = predict_image(image)

    y_true.append(0)
    y_pred.append(pred)
    y_score.append(score)

    total_latency += latency
    total_images += 1

# -----------------------------
# Evaluate Fake Images
# -----------------------------
print("Evaluating FAKE images...")

for image in fake_folder.iterdir():

    if image.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
        continue

    pred, score, latency = predict_image(image)

    y_true.append(1)
    y_pred.append(pred)
    y_score.append(score)

    total_latency += latency
    total_images += 1

# -----------------------------
# Metrics
# -----------------------------
accuracy = accuracy_score(y_true, y_pred)

precision = precision_score(y_true, y_pred)

recall = recall_score(y_true, y_pred)

f1 = f1_score(y_true, y_pred)

roc = roc_auc_score(y_true, y_score)

avg_latency = (total_latency / total_images) * 1000

fps = total_images / total_latency

cm = confusion_matrix(y_true, y_pred)

print("\n========== RESULTS ==========")

print(f"Accuracy      : {accuracy*100:.2f}%")
print(f"Precision     : {precision*100:.2f}%")
print(f"Recall        : {recall*100:.2f}%")
print(f"F1 Score      : {f1*100:.2f}%")
print(f"ROC AUC       : {roc:.4f}")
print(f"FPS           : {fps:.2f}")
print(f"Latency       : {avg_latency:.2f} ms")

print("\nConfusion Matrix")
print(cm)