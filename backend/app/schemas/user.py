from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = ""


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    settings: dict = {}


class UserSettingsUpdate(BaseModel):
    voice: str | None = None
    theme: str | None = None
    orb_color: str | None = None
    animation_speed: float | None = None
    wake_word: str | None = None
    ai_provider: str | None = None
    memory_enabled: bool | None = None
    automation_permissions: dict | None = None
