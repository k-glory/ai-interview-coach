# backend/config.py
"""
Configuration file - Loads environment variables securely
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration"""
    
    # API Key (stays on server, never sent to frontend)
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
    
    # Demo mode - if True, uses mock responses (FREE)
    DEMO_MODE = os.getenv('DEMO_MODE', 'true').lower() == 'true'
    
    # Claude model to use
    CLAUDE_MODEL = "claude-sonnet-4-20250514"
    
    # Server settings
    HOST = '127.0.0.1'
    PORT = 5000
    DEBUG = True
    
    @staticmethod
    def validate():
        """Check if configuration is valid"""
        if not Config.DEMO_MODE and not Config.ANTHROPIC_API_KEY:
            raise ValueError(
                "⚠️ ANTHROPIC_API_KEY not found in .env file!\n"
                "Either set DEMO_MODE=true or add your API key."
            )