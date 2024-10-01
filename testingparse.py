import cv2
import pytesseract
import numpy as np
from PIL import Image
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe' 

# Path to the image
image_path = "D:/GitRepos/PriceXseller8/rotated_pages/invoices 9.24.22-01.png"

# Load the image
image = cv2.imread(image_path)

# Step 1: Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Step 2: Apply bilateral filtering to reduce noise and keep edges sharp
bilateral_filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

# Step 3: Apply CLAHE for better contrast
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe_applied = clahe.apply(bilateral_filtered)

# Step 4: Apply adaptive thresholding to convert the image to binary format
adaptive_thresh = cv2.adaptiveThreshold(
    clahe_applied, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
)

# Optional Step: Manually crop regions (header, table, footer) if necessary
# Cropping the table region can help if there's too much noise elsewhere

# Perform OCR optimized for table data
custom_config = r'--oem 3 --psm 6'  # PSM 6 is better for reading tables
text = pytesseract.image_to_string(adaptive_thresh, config=custom_config)

# Save the processed image for review
processed_image_path = 'D:/GitRepos/PriceXseller8/preprocessed/test.png'
cv2.imwrite(processed_image_path, adaptive_thresh)

# Output the extracted text
print("Extracted Text:\n", text)

# Show the processed image for manual review
img = Image.open(processed_image_path)
