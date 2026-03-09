"""
Text-to-Speech service using OpenAI TTS API.
Converts interviewer text to MP3 audio and returns base64-encoded bytes.
"""

import base64
import os
import logging
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def text_to_speech_base64(text: str, voice: str = "onyx") -> str:
    """
    Convert text to MP3 audio using OpenAI TTS and return as base64.

    Args:
        text: The text to convert to speech.
        voice: OpenAI TTS voice to use (default: "onyx").

    Returns:
        Base64-encoded string of the MP3 audio bytes.
    """
    logger.info(f"Generating TTS audio ({len(text)} chars, voice={voice})")

    try:
        response = await client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
            response_format="mp3"
        )
        audio_bytes = response.content
        encoded = base64.b64encode(audio_bytes).decode("utf-8")
        logger.info(f"TTS complete: {len(audio_bytes)} bytes audio generated")
        return encoded
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise
