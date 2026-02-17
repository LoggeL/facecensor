import os
import uuid
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db
import models
import auth as auth_utils

router = APIRouter(prefix="/images", tags=["images"])

UPLOAD_DIR = "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load OpenCV face cascade once at startup
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def censor_faces(image_path: str, output_path: str) -> int:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not load image")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=4,
        minSize=(20, 20),
        flags=cv2.CASCADE_SCALE_IMAGE,
    )

    count = 0
    for (x, y, w, h) in faces:
        # Add padding around the detected face
        padding = int(0.25 * max(w, h))
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(img.shape[1], x + w + padding)
        y2 = min(img.shape[0], y + h + padding)

        face_roi = img[y1:y2, x1:x2]
        roi_h, roi_w = face_roi.shape[:2]

        if roi_w > 0 and roi_h > 0:
            # Pixelation effect — more visually striking than blur
            pixel_size = max(8, min(roi_w, roi_h) // 6)
            small_w = max(1, roi_w // pixel_size)
            small_h = max(1, roi_h // pixel_size)
            small = cv2.resize(face_roi, (small_w, small_h), interpolation=cv2.INTER_LINEAR)
            pixelated = cv2.resize(small, (roi_w, roi_h), interpolation=cv2.INTER_NEAREST)
            img[y1:y2, x1:x2] = pixelated
            count += 1

    cv2.imwrite(output_path, img)
    return count


class ImageResponse(BaseModel):
    id: int
    original_filename: str
    faces_detected: int
    status: str
    credits_used: int
    created_at: datetime
    has_processed: bool

    class Config:
        from_attributes = True


@router.post("/upload", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WebP images are allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 20MB")

    if current_user.credits < 1:
        raise HTTPException(status_code=402, detail="Insufficient credits. Please purchase more.")

    # Save original
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    file_id = str(uuid.uuid4())
    original_path = os.path.join(UPLOAD_DIR, f"{file_id}_orig{ext}")
    processed_path = os.path.join(UPLOAD_DIR, f"{file_id}_censored{ext}")

    with open(original_path, "wb") as f:
        f.write(content)

    # Deduct credit
    current_user.credits -= 1

    image_record = models.Image(
        user_id=current_user.id,
        original_filename=file.filename,
        original_path=original_path,
        processed_path=processed_path,
        status="processing",
        credits_used=1,
    )
    db.add(image_record)

    usage_tx = models.Transaction(
        user_id=current_user.id,
        credits=-1,
        type="usage",
        description=f"Face censoring: {file.filename}",
    )
    db.add(usage_tx)
    db.commit()
    db.refresh(image_record)

    # Process image
    try:
        faces = censor_faces(original_path, processed_path)
        image_record.faces_detected = faces
        image_record.status = "done"
    except Exception as e:
        image_record.status = "failed"
        image_record.processed_path = None

    db.commit()
    db.refresh(image_record)

    return ImageResponse(
        id=image_record.id,
        original_filename=image_record.original_filename,
        faces_detected=image_record.faces_detected,
        status=image_record.status,
        credits_used=image_record.credits_used,
        created_at=image_record.created_at,
        has_processed=image_record.processed_path is not None and os.path.exists(image_record.processed_path or ""),
    )


@router.get("/", response_model=List[ImageResponse])
def list_images(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    images = (
        db.query(models.Image)
        .filter(models.Image.user_id == current_user.id)
        .order_by(models.Image.created_at.desc())
        .all()
    )
    return [
        ImageResponse(
            id=img.id,
            original_filename=img.original_filename,
            faces_detected=img.faces_detected,
            status=img.status,
            credits_used=img.credits_used,
            created_at=img.created_at,
            has_processed=img.processed_path is not None and os.path.exists(img.processed_path or ""),
        )
        for img in images
    ]


@router.get("/{image_id}/original")
def get_original(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    img = db.query(models.Image).filter(
        models.Image.id == image_id,
        models.Image.user_id == current_user.id,
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    if not os.path.exists(img.original_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(img.original_path, media_type="image/jpeg")


@router.get("/{image_id}/processed")
def get_processed(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    img = db.query(models.Image).filter(
        models.Image.id == image_id,
        models.Image.user_id == current_user.id,
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    if not img.processed_path or not os.path.exists(img.processed_path):
        raise HTTPException(status_code=404, detail="Processed file not available")
    return FileResponse(img.processed_path, media_type="image/jpeg")
