import sys
from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# --------------------------
# Image Transform
# --------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# --------------------------
# Load Model
# --------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.efficientnet_b0(weights=None)

model.classifier[1] = torch.nn.Linear(
    model.classifier[1].in_features,
    2
)

model.load_state_dict(
    torch.load(
        BASE_DIR / "models" / "deepfake_model.pth",
        map_location=device
    )
)

model.to(device)
model.eval()

print("Model loaded successfully.")


# --------------------------
# Test Image
# --------------------------

image_path = BASE_DIR / "datasets" / "cropped_faces" / "real" / "01__hugging_happy_4.jpg"

image = Image.open(image_path).convert("RGB")
image = transform(image)
image = image.unsqueeze(0).to(device)

with torch.no_grad():

    outputs = model(image)

    probabilities = torch.softmax(outputs, dim=1)

    real_probability = probabilities[0][0].item()
    deepfake_probability = probabilities[0][1].item()

print(f"Real Probability      : {real_probability:.4f}")
print(f"Deepfake Probability : {deepfake_probability:.4f}")