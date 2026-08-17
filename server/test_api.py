from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app import app

IMAGE_DIR = Path("images")

EXPECTED_CROPS = {
    "cashew": "Cashew",
    "cassava": "Cassava",
    "maize": "Maize",
    "tomato": "Tomato",
}

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
}


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client



class TestAPI:
    def test_root(self, client):
        res = client.get("/")

        assert res.status_code == 200
        assert res.json() == {
            "title": "AgriSense AI API",
            "description": "API for crop identification and disease detection using deep learning.",
            "version": "1.0.0",
        }

    def test_prediction_without_image(self, client):
        res = client.post("/api/v1/crop/predict")
        assert res.status_code == 422

    def test_one_image_per_crop_without_explanation(self, client):
        for crop_folder, expected_crop_name in EXPECTED_CROPS.items():
            crop_dir = IMAGE_DIR / crop_folder

            image_paths = [
                path for path in crop_dir.iterdir()
                if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS
            ]

            assert len(image_paths) > 0, f"No test images found in {crop_dir}"

            image_path = image_paths[0]

            with open(image_path, "rb") as image:
                files = {
                    "image": (image_path.name, image, "image/jpeg")
                }

                res = client.post(
                    "/api/v1/crop/predict",
                    files=files
                )

            data = res.json()

            assert res.status_code == 200, f"Failed on image: {image_path}"
            assert data["ok"] is True
            assert data["status"] == "ok"

            prediction = data["prediction"]

            assert prediction["plant_prediction"]["class_label"] == expected_crop_name
            assert prediction["pipeline"]["predicted_plant"] == expected_crop_name
            assert (
                prediction["pipeline"]["selected_disease_model"]
                == f"{expected_crop_name} MobileNetV3"
            )
            assert prediction["explanation"] is None