import cv2
import pytesseract
import numpy as np
from matplotlib import pyplot as plt

# Specify the Tesseract OCR executable path (change if necessary)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load the image
image_path = 't1.png'  # Replace with your image file path
image = cv2.imread(image_path)

# Step 1: Convert to Grayscale
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Step 2: Denoise the image using Gaussian blur
blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)

# Step 3: Apply Adaptive Thresholding
# (This is particularly useful for images with uneven lighting)
binary_image = cv2.adaptiveThreshold(
    blurred_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
)

# Step 4: Resize the Image (scale by a factor)
scale_percent = 200  # Scale by 200%
width = int(binary_image.shape[1] * scale_percent / 100)
height = int(binary_image.shape[0] * scale_percent / 100)
resized_image = cv2.resize(binary_image, (width, height), interpolation=cv2.INTER_CUBIC)

# Step 5: Perform OCR using Tesseract
custom_config = r'--oem 3 --psm 6'  # OCR Engine Mode and Page Segmentation Mode
text = pytesseract.image_to_string(resized_image, config=custom_config)

# Display the Preprocessed Image
plt.figure(figsize=(10, 6))
plt.imshow(resized_image, cmap='gray')
plt.title('Preprocessed Image for Tesseract (Without Rotation Correction)')
plt.axis('off')
plt.show()

# Print the extracted text
print("Extracted Text:")
print(text)
