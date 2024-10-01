import cv2
import pytesseract
from cv2 import cvtColor

# Read the image using OpenCV
image = cv2.imread('C:/Program Files/Tesseract-OCR/tesseract.exe')

# Preprocess the image (convert to grayscale, thresholding, etc.)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

# Extract text
text = pytesseract.image_to_string(thresh)
print(text)
