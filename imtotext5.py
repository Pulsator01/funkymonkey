import easyocr
import cv2
import matplotlib.pyplot as plt

# Initialize EasyOCR reader with English language
reader = easyocr.Reader(['en'])

# Load the image
image_path = 't3.png'  # Change this to your image file path
image = cv2.imread(image_path)

# Preprocessing steps:
# 1. Resize the image to improve text clarity
scale_percent = 200  # Increase image size by 200% (change as needed)
width = int(image.shape[1] * scale_percent / 100)
height = int(image.shape[0] * scale_percent / 100)
dim = (width, height)
resized_image = cv2.resize(image, dim, interpolation=cv2.INTER_CUBIC)

# 2. Convert to grayscale
gray_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY)

# 3. Denoise the image using GaussianBlur
blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)

# 4. Apply adaptive thresholding for better results on uneven lighting
threshold_image = cv2.adaptiveThreshold(
    blurred_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
)

# Show the preprocessed image before OCR
plt.figure(figsize=(10, 10))
plt.imshow(cv2.cvtColor(threshold_image, cv2.COLOR_BGR2RGB))  # Convert to RGB for correct color display
plt.title('Preprocessed Image (Before OCR)')
plt.axis('off')  # Hide axes
plt.show()

# Perform OCR using EasyOCR
reader = easyocr.Reader(['en'])
result = reader.readtext(threshold_image)

# Print the detected text and confidence levels
for bbox, text, confidence in result:
    print(f"Detected text: {text} (Confidence: {confidence:.2f})")

# Draw bounding boxes around detected text
for bbox, text, confidence in result:
    top_left = tuple(map(int, bbox[0]))
    bottom_right = tuple(map(int, bbox[2]))
    threshold_image = cv2.rectangle(threshold_image, top_left, bottom_right, (0, 255, 0), 2)
    cv2.putText(
        threshold_image, text, top_left, cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2, cv2.LINE_AA
    )

# Convert image to RGB for displaying in matplotlib
image_rgb = cv2.cvtColor(threshold_image, cv2.COLOR_BGR2RGB)

# Display the image with bounding boxes
plt.figure(figsize=(10, 10))
plt.imshow(image_rgb)
plt.title('Processed Image with OCR Results')
plt.axis('off')  # Hide axes
plt.show()
