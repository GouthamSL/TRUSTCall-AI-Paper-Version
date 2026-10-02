import torch
from pathlib import Path
from PIL import Image
from torchvision import models, transforms


class DeepfakeDetector:

    def __init__(self):

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

        self.model = models.efficientnet_b0(weights=None)

        self.model.classifier[1] = torch.nn.Linear(
            self.model.classifier[1].in_features,
            2
        )

        base_dir = Path(__file__).resolve().parent.parent

        model_path = base_dir / "models" / "deepfake_model.pth"

        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        self.model.load_state_dict(
            torch.load(
                model_path,
                map_location=self.device
            )
        )
    

        self.model.to(self.device)
        self.model.eval()

        print("Deepfake Detector Loaded Successfully")

    def predict(self, face_image):

        if face_image is None:
            return {
                "real_probability": None,
                "deepfake_probability": None,
                "vision_score": None
            }

        image = Image.fromarray(face_image)

        image = self.transform(image)

        image = image.unsqueeze(0).to(self.device)

        with torch.no_grad():

            outputs = self.model(image)

            probabilities = torch.softmax(outputs, dim=1)

            real_probability = probabilities[0][0].item()

            deepfake_probability = probabilities[0][1].item()

        return {
            "real_probability": real_probability,
            "deepfake_probability": deepfake_probability,
            "vision_score": real_probability
        }