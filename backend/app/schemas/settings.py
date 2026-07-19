from pydantic import BaseModel


class SystemStats(BaseModel):
    cpu_percent: float
    cpu_per_core: list[float]
    ram_percent: float
    ram_used_gb: float
    ram_total_gb: float
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float
    net_sent_mb: float
    net_recv_mb: float
    gpu: list[dict] = []
    top_processes: list[dict] = []
