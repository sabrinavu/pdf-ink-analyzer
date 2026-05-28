from django.shortcuts import render

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import os

from .utils import analyze_pdf_ink

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_and_analyze_poster(request):
    if 'file' not in request.FILES:
        return Response(
            {"error": "No file uploaded."},
            status=status.HTTP_400_BAD_REQUEST    
        )
    
    uploaded_file = request.FILES['file']

    if not uploaded_file.name.endswith('.pdf'):
        return Response(
            {"error": "Invalid file type. Please upload a PDF poster design."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        temp_path = default_storage.save(
            f"tmp/{uploaded_file.name}", 
            ContentFile(uploaded_file.read())
        )
        full_temp_path = os.path.join(default_storage.location, temp_path)
        
        analysis_results = analyze_pdf_ink(full_temp_path)
        
        if os.path.exists(full_temp_path):
            os.remove(full_temp_path)
            
        if "error" in analysis_results:
            return Response(analysis_results, status=status.HTTP_400_BAD_REQUEST)
            
        return Response(analysis_results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": f"Internal server processing error: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )