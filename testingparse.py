import cv2
import pytesseract
import numpy as np

# Path to the image
image_path = "F:/repogit/Xseller8/rotated_pages/invoices 9.24.22-23.png"

# Load the image
image = cv2.imread(image_path)

# Step 1: Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Step 2: Remove noise using non-local means denoising
denoised = cv2.fastNlMeansDenoising(gray, None, h=30, templateWindowSize=7, searchWindowSize=21)

# Step 3: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) for contrast enhancement
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
clahe_applied = clahe.apply(denoised)

# Step 4: Detect edges to remove gridlines using Canny edge detection
edges = cv2.Canny(clahe_applied, 50, 150, apertureSize=3)

# Step 5: Find and remove contours (gridlines, borders, etc.)
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
for contour in contours:
    if cv2.contourArea(contour) > 5000:  # Adjust this based on the size of the gridlines
        cv2.drawContours(image, [contour], -1, (255, 255, 255), 5)  # Draw over large contours with white

# Step 6: Apply adaptive thresholding after removing contours
adaptive_thresh = cv2.adaptiveThreshold(
    clahe_applied, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
)

# Step 7: Apply Morphological Transformations (Closing to thicken text)
kernel = np.ones((2, 2), np.uint8)
morphed = cv2.morphologyEx(adaptive_thresh, cv2.MORPH_CLOSE, kernel)

# Step 8: OCR with a configuration optimized for table-like text
custom_config = r'--oem 3 --psm 6'  # PSM 6 assumes a uniform block of text
text = pytesseract.image_to_string(morphed, config=custom_config)

# Save the processed image (for visualization purposes)
processed_image_path = 'F:/repogit/Xseller8/rotated_pages/processed_invoice3.png'
cv2.imwrite(processed_image_path, morphed)

# Output the extracted text
print("Extracted Text:\n", text)

# Show the processed image
cv2.imshow('Final Processed Image', morphed)
cv2.waitKey(0)
cv2.destroyAllWindows()