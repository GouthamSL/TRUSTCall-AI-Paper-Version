import timm
import torch
from torchvision import transforms

print("Loading model...")

model = timm.create_model(
    "efficientnet_b0",
    pretrained=True
)

model.eval()

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

print("Model loaded successfully.")


def get_model():
    return model


def get_transform():
    return transform