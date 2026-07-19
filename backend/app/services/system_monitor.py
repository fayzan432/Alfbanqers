"""Live host system stats: CPU, RAM, disk, network, GPU, top processes."""
from __future__ import annotations

import psutil

_last_net = psutil.net_io_counters()


def _bytes_to_gb(n: int) -> float:
    return round(n / (1024**3), 2)


def _bytes_to_mb(n: int) -> float:
    return round(n / (1024**2), 2)


def get_gpu_stats() -> list[dict]:
    try:
        import pynvml

        pynvml.nvmlInit()
        count = pynvml.nvmlDeviceGetCount()
        stats = []
        for i in range(count):
            handle = pynvml.nvmlDeviceGetHandleByIndex(i)
            name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(name, bytes):
                name = name.decode()
            mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            stats.append(
                {
                    "name": name,
                    "utilization_percent": util.gpu,
                    "memory_used_gb": _bytes_to_gb(mem.used),
                    "memory_total_gb": _bytes_to_gb(mem.total),
                }
            )
        pynvml.nvmlShutdown()
        return stats
    except Exception:  # noqa: BLE001  (no NVIDIA GPU / pynvml not available)
        return []


def get_top_processes(limit: int = 8) -> list[dict]:
    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            info = proc.info
            processes.append(
                {
                    "pid": info["pid"],
                    "name": info["name"],
                    "cpu_percent": round(info["cpu_percent"] or 0.0, 1),
                    "memory_percent": round(info["memory_percent"] or 0.0, 1),
                }
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    processes.sort(key=lambda p: p["cpu_percent"], reverse=True)
    return processes[:limit]


def get_system_stats() -> dict:
    global _last_net

    cpu_percent = psutil.cpu_percent(interval=0.1)
    cpu_per_core = psutil.cpu_percent(interval=0.0, percpu=True)

    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()

    sent_delta = max(net.bytes_sent - _last_net.bytes_sent, 0)
    recv_delta = max(net.bytes_recv - _last_net.bytes_recv, 0)
    _last_net = net

    return {
        "cpu_percent": cpu_percent,
        "cpu_per_core": cpu_per_core,
        "ram_percent": mem.percent,
        "ram_used_gb": _bytes_to_gb(mem.used),
        "ram_total_gb": _bytes_to_gb(mem.total),
        "disk_percent": disk.percent,
        "disk_used_gb": _bytes_to_gb(disk.used),
        "disk_total_gb": _bytes_to_gb(disk.total),
        "net_sent_mb": _bytes_to_mb(sent_delta),
        "net_recv_mb": _bytes_to_mb(recv_delta),
        "gpu": get_gpu_stats(),
        "top_processes": get_top_processes(),
    }
