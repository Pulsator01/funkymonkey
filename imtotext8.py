import cv2
import easyocr
import pytesseract
import matplotlib.pyplot as plt

# Initialize EasyOCR reader with English language
easyocr_reader = easyocr.Reader(['en'])

# Set Tesseract executable path if needed (uncomment and adjust for your system)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_path):
    """
    Preprocesses the image to improve OCR accuracy based on the techniques mentioned in the article.
    """
    # Load the image
    image = image_path

    # Resize the image for better clarity (scale by 200%)
    scale_percent = 200  # Change this value to adjust scaling
    width = int(image.shape[1] * scale_percent / 100)
    height = int(image.shape[0] * scale_percent / 100)
    dim = (width, height)
    resized_image = cv2.resize(image, dim, interpolation=cv2.INTER_CUBIC)

    # Convert the image to grayscale (important for both OCR tools)
    gray_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY)

    # Denoise the image using GaussianBlur
    blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)

    # Apply adaptive thresholding for better results on uneven lighting
    threshold_image = cv2.adaptiveThreshold(
        blurred_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return threshold_image, resized_image

def easyocr_ocr(threshold_image):
    """
    Perform OCR using EasyOCR on the preprocessed image.
    """
    result = easyocr_reader.readtext(threshold_image)

    # Print the detected text and confidence levels
    for bbox, text, confidence in result:
        print(f"Detected text: {text} (Confidence: {confidence:.2f})")

    return result

def tesseract_ocr(threshold_image):
    """
    Perform OCR using Tesseract on the preprocessed image.
    """
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(threshold_image, config=custom_config)

    print(f"Detected text (Tesseract): {text}")

    return text

def display_image_with_text(image, result, ocr_tool="EasyOCR"):
    """
    Display the image with bounding boxes around detected text using either EasyOCR or Tesseract.
    """
    if ocr_tool == "EasyOCR":
        for bbox, text, confidence in result:
            top_left = tuple(map(int, bbox[0]))
            bottom_right = tuple(map(int, bbox[2]))
            image = cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 2)
            cv2.putText(image, text, top_left, cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
    else:
        # For Tesseract, we don't get bounding boxes easily, so just display text at the top left
        cv2.putText(image, "Tesseract OCR Result:", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        cv2.putText(image, text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    plt.figure(figsize=(10, 10))
    plt.imshow(image_rgb)
    plt.axis('off')
    plt.show()

def main():
    image_path = cv2.imread('t3.png')

    # Preprocess the image
    threshold_image, original_image = preprocess_image(image_path)

    # Ask the user to choose between EasyOCR and Tesseract
    ocr_choice = input("Choose OCR tool (1 for EasyOCR, 2 for Tesseract): ")

    if ocr_choice == '1':
        print("Using EasyOCR...")
        result = easyocr_ocr(threshold_image)
        display_image_with_text(original_image, result, ocr_tool="EasyOCR")
    elif ocr_choice == '2':
        print("Using Tesseract...")
        result = tesseract_ocr(threshold_image)
        display_image_with_text(original_image, result, ocr_tool="Tesseract")
    else:
        print("Invalid choice, please choose either 1 or 2.")

if __name__ == "__main__":
    main()
