FROM python:3.11-slim

WORKDIR /app

# tesseract-ocr: OCR (app/vision/ocr.py)
# ffmpeg: audio decoding for faster-whisper / edge-tts output
# libgl1 + libglib2.0-0: OpenCV runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m playwright install --with-deps chromium

COPY . .

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
