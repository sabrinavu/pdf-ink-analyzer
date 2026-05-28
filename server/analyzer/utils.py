# making the pixel density math live here

import cv2
import numpy as np
from pdf2image import convert_from_path

def analyze_pdf_ink(pdf_path):
    try:
        pdf = convert_from_path(pdf_path)
        if not pdf:
            raise ValueError("The uploaded PDF is empty.")
        if len(pdf) > 1:
            raise ValueError("This took only accepts 1-page posters. Please submit a poster pdf of one page.")
        
        page = pdf[0]

    except Exception as e:
        return {"error": f"Extraction failed: {str(e)}"}
    
    
    # conversion from the page to an openCV bgr matrix array
    poster = cv2.cvtColor(np.array(page), cv2.COLOR_RGB2BGR)
    
    total_pixels = poster.shape[0] * poster.shape[1]

    white_rgb = np.array([255,255,255])
    white_mask = cv2.inRange(image, white_rgb, white_rgb) # runs much faster than checking rgb value against white_rgb

    white_pixels = cv2.countNonZero(white_mask)

    ink_pixels = total_pixels - white_pixels

    return {
        "page": 1,
        "white_space": round((white_pixels/total_pixels) * 100, 2),
        "ink_coverage": round((ink_pixels/total_pixels) * 100, 2)
    }