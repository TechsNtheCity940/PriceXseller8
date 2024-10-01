import cv2
import pytesseract
import numpy as np

# Path to the image
image_path = "F:/repogit/Xseller8/rotated_pages/invoices 9.24.22-23.png"

# Load the image
image = cv2.imread(image_path)

# Step 1: Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Step 2: Apply a mild denoising filter to remove small noise but preserve details
denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)

# Step 3: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to enhance text contrast
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe_applied = clahe.apply(denoised)

# Step 4: Apply adaptive thresholding, but keep it mild to preserve text details
adaptive_thresh = cv2.adaptiveThreshold(
    clahe_applied, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
)

# Step 5: Perform OCR with a basic configuration optimized for text extraction
custom_config = r'--oem 3 --psm 6'
text = pytesseract.image_to_string(adaptive_thresh, config=custom_config)

# Save the processed image (for visualization purposes)
processed_image_path = 'F:/repogit/Xseller8/rotated_pages/processed_invoice4.png'
cv2.imwrite(processed_image_path, adaptive_thresh)

# Output the extracted text
print("Extracted Text:\n", text)

# Show the processed image for manual review
cv2.imshow('Processed Image', adaptive_thresh)
cv2.waitKey(0)
cv2.destroyAllWindows()