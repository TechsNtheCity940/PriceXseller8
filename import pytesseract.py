import pytesseract
from PIL import Image

# Ensure that pytesseract can find the tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'  # Set to your path if on Windows

# Test with a sample image
img = Image.open("D:/GitRepos/PriceXseller8/rotated_pages/invoices 9.24.22-09.png")  # Replace with an actual image file path
text = pytesseract.image_to_string(img)

print(text)
