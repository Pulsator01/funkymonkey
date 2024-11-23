import easyocr
import cv2
import matplotlib.pyplot as plt

# Initialize EasyOCR reader with English language
reader = easyocr.Reader(['en'])

# Load the image
image_path = 't5.png'  # Change this to your image file path
image = cv2.imread(image_path)

# Function to preprocess images for model A
def preprocess_a(image):
    # Convert to grayscale and apply thresholding
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, threshold_image = cv2.threshold(gray_image, 150, 255, cv2.THRESH_BINARY)
    return threshold_image

# Function to preprocess images for model B
def preprocess_b(image):
    # Resize, convert to grayscale, denoise, and apply adaptive thresholding
    scale_percent = 200  # Increase image size by 200% (change as needed)
    width = int(image.shape[1] * scale_percent / 100)
    height = int(image.shape[0] * scale_percent / 100)
    dim = (width, height)
    resized_image = cv2.resize(image, dim, interpolation=cv2.INTER_CUBIC)
    gray_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY)
    blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)
    threshold_image = cv2.adaptiveThreshold(blurred_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    return threshold_image


# Perform OCR using each model
threshold_image_a = preprocess_a(image)
threshold_image_b = preprocess_b(image)

# OCR results for each model
result_a = reader.readtext(threshold_image_a)
result_b = reader.readtext(threshold_image_b)

# Calculate the confidence levels for each result
confidence_a = sum([confidence for _, _, confidence in result_a])
confidence_b = sum([confidence for _, _, confidence in result_b])

# Compare confidence levels and select the result with the highest confidence
if confidence_a >= confidence_b:
    best_result = result_a
    best_confidence = confidence_a
    model_name = 'Model A'
elif confidence_b >= confidence_a:
    best_result = result_b
    best_confidence = confidence_b
    model_name = 'Model B'

# Print the selected model and its detected text with confidence
print(f"Best Model: {model_name} (Confidence: {best_confidence:.2f})")
for bbox, text, confidence in best_result:
    print(f"Detected text: {text} (Confidence: {confidence:.2f})")

# Draw bounding boxes around the detected text from the best model
for bbox, text, confidence in best_result:
    top_left = tuple(map(int, bbox[0]))
    bottom_right = tuple(map(int, bbox[2]))
    threshold_image_a = cv2.rectangle(threshold_image_a, top_left, bottom_right, (0, 255, 0), 2)
    cv2.putText(threshold_image_a, text, top_left, cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2, cv2.LINE_AA)

# Convert the image with bounding boxes to RGB for displaying
image_rgb = cv2.cvtColor(threshold_image_a, cv2.COLOR_BGR2RGB)

# Display the image with bounding boxes
plt.figure(figsize=(10, 10))
plt.imshow(image_rgb)
plt.title(f'Processed Image with OCR Results from {model_name} (Confidence: {best_confidence:.2f})')
plt.axis('off')  # Hide axes
plt.show()
