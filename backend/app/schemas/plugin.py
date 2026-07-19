from pydantic import BaseModel


class PluginManifest(BaseModel):
    slug: str
    name: str
    description: str = ""
    version: str = "0.1.0"
    permissions: list[str] = []
    entry_point: str


class PluginRead(PluginManifest):
    enabled: bool = True


class PluginInvokeRequest(BaseModel):
    action: str
    params: dict = {}
