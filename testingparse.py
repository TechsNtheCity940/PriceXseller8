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

<<<<<<< HEAD
# Step 2: Apply a mild denoising filter to remove small noise but preserve details
denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)

# Step 3: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to enhance text contrast
=======
# Step 2: Apply bilateral filtering to reduce noise and keep edges sharp
bilateral_filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

# Step 3: Apply CLAHE for better contrast
>>>>>>> 673eea78bb9e1034ed4853f958c9292e03cbf1a8
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe_applied = clahe.apply(bilateral_filtered)

<<<<<<< HEAD
# Step 4: Apply adaptive thresholding, but keep it mild to preserve text details
=======
# Step 4: Apply adaptive thresholding to convert the image to binary format
>>>>>>> 673eea78bb9e1034ed4853f958c9292e03cbf1a8
adaptive_thresh = cv2.adaptiveThreshold(
    clahe_applied, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
)

<<<<<<< HEAD
# Step 5: Perform OCR with a basic configuration optimized for text extraction
custom_config = r'--oem 3 --psm 6'
text = pytesseract.image_to_string(adaptive_thresh, config=custom_config)

# Save the processed image (for visualization purposes)
processed_image_path = 'F:/repogit/Xseller8/rotated_pages/processed_invoice4.png'
=======
# Optional Step: Manually crop regions (header, table, footer) if necessary
# Cropping the table region can help if there's too much noise elsewhere

# Perform OCR optimized for table data
custom_config = r'--oem 3 --psm 6'  # PSM 6 is better for reading tables
text = pytesseract.image_to_string(adaptive_thresh, config=custom_config)

# Save the processed image for review
processed_image_path = 'D:/GitRepos/PriceXseller8/preprocessed/test.png'
>>>>>>> 673eea78bb9e1034ed4853f958c9292e03cbf1a8
cv2.imwrite(processed_image_path, adaptive_thresh)

# Output the extracted text
print("Extracted Text:\n", text)

# Show the processed image for manual review
<<<<<<< HEAD
cv2.imshow('Processed Image', adaptive_thresh)
cv2.waitKey(0)
cv2.destroyAllWindows()
=======
img = Image.open(processed_image_path)
>>>>>>> 673eea78bb9e1034ed4853f958c9292e03cbf1a8
