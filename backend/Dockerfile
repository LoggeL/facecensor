FROM python:3.12-slim

WORKDIR /app

# Install system deps for headless OpenCV (libgl1-mesa-glx removed in Debian trixie)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0t64 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
