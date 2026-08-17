## AgriSense AI (API Documentation)

AgriSense AI is a mobile-based plant identification and crop disease detection system powered by a two-stage MobileNetV3 deep learning pipeline. The system first identifies the plant type from an uploaded leaf image, then routes the image to the correct plant-specific disease detection model.

The system supports explainable AI using Grad-CAM, allowing users to view image regions that influenced the model prediction.

### Project Overview

The prediction pipeline follows this structure:

```text
Input Leaf Image
        ↓
Plant Identification Model
        ↓
Plant-Specific Disease Detection Model
        ↓
Disease / Pest / Healthy Prediction
        ↓
Confidence Score + Optional Grad-CAM Explanation
```

### Supported Plants

The system currently supports the following plant categories:

- Cashew
- Cassava
- Maize
- Tomato

### Model Pipeline

The project uses separate MobileNetV3 models for each stage.

| Stage   | Model                            | Purpose                                               |
| ------- | -------------------------------- | ----------------------------------------------------- |
| Stage 1 | Plant Identification MobileNetV3 | Predicts the plant type                               |
| Stage 2 | Cashew Disease MobileNetV3       | Detects Cashew diseases, pests, or healthy condition  |
| Stage 2 | Cassava Disease MobileNetV3      | Detects Cassava diseases, pests, or healthy condition |
| Stage 2 | Maize Disease MobileNetV3        | Detects Maize diseases, pests, or healthy condition   |
| Stage 2 | Tomato Disease MobileNetV3       | Detects Tomato diseases or healthy condition          |

### Key Features

- Mobile-based crop image prediction
- Plant identification before disease detection
- Plant-specific disease classification
- MobileNetV3-based deep learning models
- Weighted cross-entropy loss for class imbalance
- Grad-CAM explainability
- FastAPI backend for prediction requests
- REST API support for mobile application integration
- Grad-CAM image storage and retrieval endpoint

### Dataset

The project uses the CCMT crop pest and disease dataset. Only the **Raw Data** folder is used because it contains the original non-augmented images.

The original dataset structure follows this format:

```text
Raw Data/
├── Cashew/
│   ├── anthracnose/
│   ├── gumosis/
│   └── healthy/
├── Cassava/
│   ├── bacterial_blight/
│   ├── brown_spot/
│   └── healthy/
├── Maize/
│   ├── fall_armyworm/
│   ├── grasshopper/
│   └── healthy/
└── Tomato/
    ├── bacterial_spot/
    ├── leaf_mold/
    └── healthy/
```

A separate plant identification dataset is created by grouping all images by plant type:

```text
Plant Identification/
├── Cashew/
├── Cassava/
├── Maize/
└── Tomato/
```

### API Endpoint

#### Predict Crop and Disease

```http
POST /api/v1/crop/predict
```

#### Request Body

The API expects an image file using form data.

| Field     | Type    | Required | Description                                           |
| --------- | ------- | -------- | ----------------------------------------------------- |
| `image`   | File    | Yes      | Leaf image to classify                                |
| `explain` | Boolean | No       | Set to `true` to generate Grad-CAM explanation images |

### Using cURL

#### Prediction without Grad-CAM Explanation

```shell
curl -X POST \
  -F image=@maize_leaf.jpg \
  http://127.0.0.1:8000/api/v1/crop/predict
```

#### Prediction with Grad-CAM Explanation

```shell
curl -X POST \
  -F image=@maize_leaf.jpg \
  -F explain=true \
  http://127.0.0.1:8000/api/v1/crop/predict
```

### Expected Response Without Explanation

```json
{
  "time": 0.053606900000886526,
  "ok": true,
  "status": "ok",
  "prediction": {
    "plant_prediction": {
      "label": 2,
      "class_label": "Maize",
      "probability": 1.0
    },
    "plant_probabilities": [
      { "label": 0, "class_label": "Cashew", "probability": 0.0 },
      { "label": 1, "class_label": "Cassava", "probability": 0.0 },
      { "label": 2, "class_label": "Maize", "probability": 1.0 },
      { "label": 3, "class_label": "Tomato", "probability": 0.0 }
    ],
    "disease_prediction": {
      "label": 5,
      "class_label": "leaf spot",
      "probability": 0.714
    },
    "disease_probabilities": [
      { "label": 0, "class_label": "fall armyworm", "probability": 0.0004 },
      { "label": 1, "class_label": "grasshoper", "probability": 0.0001 },
      { "label": 2, "class_label": "healthy", "probability": 0.2351 },
      { "label": 3, "class_label": "leaf beetle", "probability": 0.0116 },
      { "label": 4, "class_label": "leaf blight", "probability": 0.0059 },
      { "label": 5, "class_label": "leaf spot", "probability": 0.714 },
      { "label": 6, "class_label": "streak virus", "probability": 0.0328 }
    ],
    "pipeline": {
      "predicted_plant": "Maize",
      "selected_disease_model": "Maize MobileNetV3"
    },
    "explanation": null
  },
  "size": "54.97 KB",
  "id": "5471e4bc-b6f2-4404-be5b-1f70e54767de"
}
```

### Expected Response With Explanation

When `explain=true` is included in the form, the API returns Grad-CAM explanation image filenames.

```json
{
  "time": 1.3611246000000392,
  "ok": true,
  "status": "ok",
  "id": "5471e4bc-b6f2-4404-be5b-1f70e54767de",
  "prediction": {
    "plant_prediction": {
      "label": 2,
      "class_label": "Maize",
      "probability": 1.0
    },
    "plant_probabilities": [
      { "label": 0, "class_label": "Cashew", "probability": 0.0 },
      { "label": 1, "class_label": "Cassava", "probability": 0.0 },
      { "label": 2, "class_label": "Maize", "probability": 1.0 },
      { "label": 3, "class_label": "Tomato", "probability": 0.0 }
    ],
    "disease_prediction": {
      "label": 5,
      "class_label": "leaf spot",
      "probability": 0.714
    },
    "disease_probabilities": [
      { "label": 0, "class_label": "fall armyworm", "probability": 0.0004 },
      { "label": 1, "class_label": "grasshoper", "probability": 0.0001 },
      { "label": 2, "class_label": "healthy", "probability": 0.2351 },
      { "label": 3, "class_label": "leaf beetle", "probability": 0.0116 },
      { "label": 4, "class_label": "leaf blight", "probability": 0.0059 },
      { "label": 5, "class_label": "leaf spot", "probability": 0.714 },
      { "label": 6, "class_label": "streak virus", "probability": 0.0328 }
    ],
    "pipeline": {
      "predicted_plant": "Maize",
      "selected_disease_model": "Maize MobileNetV3"
    },
    "explanation": {
      "gradcam": "maize_5471e4bc-b6f2-4404-be5b-1f70e54767de_gradcam.png",
      "bbox": "maize_5471e4bc-b6f2-4404-be5b-1f70e54767de_bbox.png",
      "original": "maize_5471e4bc-b6f2-4404-be5b-1f70e54767de_original.png"
    }
  },
  "size": "54.97 KB"
}
```

### Accessing Grad-CAM Images

When explanation is enabled, the API saves the original image, Grad-CAM heatmap, and bounding-box visualization.

The general URL format is:

```shell
BASE_URL/api/v1/crop/storage/gradcam/FILENAME
```

Example:

```shell
http://127.0.0.1:8000/api/v1/crop/storage/gradcam/maize_5471e4bc-b6f2-4404-be5b-1f70e54767de_gradcam.png
```

| Image Type | Description                                |
| ---------- | ------------------------------------------ |
| `original` | Uploaded image used for prediction         |
| `gradcam`  | Grad-CAM heatmap showing activated regions |
| `bbox`     | Grad-CAM-based bounding-box visualization  |

### Running the API

Start the FastAPI server using:

```shell
uvicorn app:app --host 0.0.0.0 --port 8000
```

After starting the server, the API will be available locally at:

```shell
http://127.0.0.1:8000
```

### Accessing the API from Another Device

To access the API from another device on the same network, get your machine’s IPv4 address.

For macOS or Linux:

```shell
ifconfig
```

For Windows:

```shell
ipconfig
```

The network server URL will look similar to:

```shell
http://192.168.1.50:8000
```

Example request from another device:

```shell
curl -X POST \
  -F image=@maize_leaf.jpg \
  http://192.168.1.50:8000/api/v1/crop/predict
```

### Running Tests

To run unit tests for the API, use:

```shell
pytest
```

### Example Mobile App Workflow

1. User captures or uploads a leaf image.
2. The image is sent to the FastAPI backend.
3. The plant identification model predicts the plant type.
4. The correct plant-specific disease model is selected.
5. The disease model predicts the disease, pest, or healthy condition.
6. The API returns the predicted plant, predicted disease, confidence scores, and optional Grad-CAM explanation images.
7. The mobile app displays the result to the user.

### Suggested Mobile Screens

- Home screen
- Image capture/upload screen
- Prediction result screen
- Grad-CAM explanation screen
- Prediction history screen
- Disease information screen
- About system screen

### Technology Stack

| Layer              | Technology           |
| ------------------ | -------------------- |
| Deep Learning      | PyTorch, TorchVision |
| Model Architecture | MobileNetV3          |
| Backend API        | FastAPI              |
| Explainability     | Grad-CAM             |
| Image Processing   | PIL, NumPy           |
| Mobile App         | React Native or Expo |
| Testing            | Pytest               |

### Notes

- The system is designed for agricultural decision support and should not replace expert agronomic diagnosis.
- Model predictions should be interpreted together with field knowledge and expert advice.
- Grad-CAM explanations are used for qualitative interpretation and may not always represent exact disease boundaries.
