from __future__ import annotations
import base64
from pathlib import Path
import streamlit.components.v1 as components
from PIL import Image
import numpy as np
from dataclasses import dataclass
from typing import Optional
from io import BytesIO


@dataclass
class DrawingResults:
    is_submitted: bool
    raw_image_bytes: Optional[bytes] = None
    raw_image_base64: Optional[str] = None
    resized_grayscale_pillow: Optional[Image.Image] = None
    resized_grayscale_array: Optional[np.ndarray] = None


_frontend_dir = (Path(__file__).parent / "frontend").absolute()
_declare_component = components.declare_component(
    "st_mnist_canvas", path=str(_frontend_dir)
)


def _data_url_to_bytes(data_url: str) -> bytes:
    _, encoded = data_url.split(";base64,")
    return base64.b64decode(encoded)


def _bytes_to_pillow(image_bytes: bytes) -> Image.Image:
    image = Image.open(BytesIO(image_bytes))
    return image.convert("L").resize((28, 28), Image.ANTIALIAS)


def _pillow_to_array(image: Image.Image) -> np.ndarray:
    return np.array(image)


def st_mnist_canvas(
    stroke_width: int = 20,
    stroke_color: str = "#FFFFFF",
    background_color: str = "#000000",
    width: int = 280,
    height: int = 280,
    button_height: int = 30,
    submit_button_label: str = "Submit",
    submit_background_color: str = "#FBFBFB",
    clear_button_label: str = "Clear",
    clear_background_color: str = "#FBFBFB",
    key=None,
) -> DrawingResults:
    component_value = _declare_component(
        strokeWidth=stroke_width,
        strokeColor=stroke_color,
        backgroundColor=background_color,
        canvasWidth=width,
        canvasHeight=height,
        buttonHeight=button_height,
        submitButtonLabel=submit_button_label,
        submitBackgroundColor=submit_background_color,
        clearButtonLabel=clear_button_label,
        clearBackgroundColor=clear_background_color,
        key=key,
        default=None,
    )

    is_submitted = (
        component_value.get("is_submitted", False) if component_value else False
    )
    raw_image_base64 = component_value.get("image_data") if component_value else None
    raw_image_bytes = _data_url_to_bytes(raw_image_base64) if raw_image_base64 else None

    if raw_image_bytes:
        resized_grayscale_pillow = _bytes_to_pillow(raw_image_bytes)
        resized_grayscale_array = _pillow_to_array(resized_grayscale_pillow)
    else:
        resized_grayscale_pillow = None
        resized_grayscale_array = None

    return DrawingResults(
        is_submitted=is_submitted,
        raw_image_bytes=raw_image_bytes,
        raw_image_base64=raw_image_base64,
        resized_grayscale_pillow=resized_grayscale_pillow,
        resized_grayscale_array=resized_grayscale_array,
    )
