"""
Vercel serverless entry point.
Exposes the FastAPI app for Vercel's Python runtime.
"""
import sys
import os

# Add the parent directory (backend/) to the Python path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
