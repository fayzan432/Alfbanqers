"""Registers vision actions (webcam, screen, OCR, detection, face
recognition) as tools the reasoning agent can call.
"""
from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.vision import detection, face, ocr, screen, webcam


async def _capture_webcam(args: dict, ctx: ToolContext) -> dict:
    path = webcam.capture_frame(int(args.get("device_index", 0)))
    return {"path": path}


async def _read_screen(args: dict, ctx: ToolContext) -> dict:
    return screen.read_screen_text()


async def _read_document(args: dict, ctx: ToolContext) -> dict:
    return {"text": ocr.extract_text(args["image_path"])}


async def _detect_objects(args: dict, ctx: ToolContext) -> dict:
    return {"detections": detection.detect_objects(args["image_path"], args.get("kind", "face"))}


async def _recognize_faces(args: dict, ctx: ToolContext) -> dict:
    return {"faces": face.recognize_faces(args["image_path"])}


async def _enroll_face(args: dict, ctx: ToolContext) -> dict:
    return face.enroll_face(args["person_name"], args["image_paths"])


tool_registry.register(
    ToolDefinition("capture_webcam", "Capture a still frame from the webcam.", {
        "type": "object", "properties": {"device_index": {"type": "integer", "default": 0}}
    }),
    _capture_webcam,
)

tool_registry.register(
    ToolDefinition("read_screen", "Capture the screen and OCR any visible text from it.", {"type": "object", "properties": {}}),
    _read_screen,
)

tool_registry.register(
    ToolDefinition("read_document", "Run OCR on an image file to extract its text.", {
        "type": "object", "properties": {"image_path": {"type": "string"}}, "required": ["image_path"]
    }),
    _read_document,
)

tool_registry.register(
    ToolDefinition("detect_objects", "Detect faces/eyes/bodies in an image and return bounding boxes.", {
        "type": "object",
        "properties": {"image_path": {"type": "string"}, "kind": {"type": "string", "enum": ["face", "eye", "body", "smile"], "default": "face"}},
        "required": ["image_path"],
    }),
    _detect_objects,
)

tool_registry.register(
    ToolDefinition("recognize_faces", "Identify enrolled people in an image. Requires user consent.", {
        "type": "object", "properties": {"image_path": {"type": "string"}}, "required": ["image_path"]
    }),
    _recognize_faces,
)

tool_registry.register(
    ToolDefinition("enroll_face", "Enroll a new person for face recognition from sample images. Requires user consent.", {
        "type": "object",
        "properties": {"person_name": {"type": "string"}, "image_paths": {"type": "array", "items": {"type": "string"}}},
        "required": ["person_name", "image_paths"],
    }),
    _enroll_face,
)
