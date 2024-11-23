import easyocr
import cv2
import matplotlib.pyplot as plt

# Initialize EasyOCR reader with English language
reader = easyocr.Reader(['en'])

# Load the image (use OpenCV or PIL to load it)
image_path = 't3.png'  # Change this to your image file path
image = cv2.imread(image_path)

# Optionally, preprocess the image to improve OCR accuracy
# Convert to grayscale (useful for low-quality images)
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply thresholding or denoising to clean up the image
_, threshold_image = cv2.threshold(gray_image, 150, 255, cv2.THRESH_BINARY)

plt.figure(figsize=(10, 10))
plt.imshow(cv2.cvtColor(threshold_image, cv2.COLOR_BGR2RGB))  # Convert to RGB for correct color display
plt.title('Preprocessed Image (Before OCR)')
plt.axis('off')  # Hide axes
plt.show()

# Perform OCR using EasyOCR
result = reader.readtext(threshold_image)

# Print the detected text and confidence levels
for bbox, text, confidence in result:
    print(f"Detected text: {text} (Confidence: {confidence:.2f})")

# Optional: Display the processed image with bounding boxes
for bbox, text, confidence in result:
    top_left = tuple(bbox[0])
    bottom_right = tuple(bbox[2])
    image = cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 2)
    cv2.putText(image, text, top_left, cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)

# Convert image to RGB for displaying in matplotlib
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Display the image with bounding boxes
plt.figure(figsize=(10, 10))
plt.imshow(image_rgb)
plt.axis('off')  # Hide axes
plt.show()
