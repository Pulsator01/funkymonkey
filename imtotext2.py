from PIL import Image
import cv2
import pytesseract

# Path to Tesseract executable (Windows only)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load the image
image_path = 't3.png'
image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

# Preprocessing: Resize and Threshold
image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
_, thresh_image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)

# OCR with Tesseract
text = pytesseract.image_to_string(thresh_image, lang='eng', config='--oem 3 --psm 6')

# Output the text
print("Extracted Text:")
print(text)
