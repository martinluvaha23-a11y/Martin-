"""Santapris School System — LAN / Wi-Fi edition (modernized server).

Run:  python school_system.py [--host 0.0.0.0] [--port 8000] [--db PATH]
"""
import argparse
import os
import socket
import sys


def get_all_local_ips():
    """Discover every non-loopback IPv4 address on this machine (LAN, Wi-Fi,
    Ethernet, ...). No internet required — a UDP 'connect' per common gateway
    just makes the OS reveal which local IP each interface uses."""
    ips = []
    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = info[4][0]
            if not ip.startswith("127.") and ip not in ips:
                ips.append(ip)
    except Exception:
        pass
    try:
        for remote in ("8.8.8.8", "1.1.1.1", "192.168.0.1", "10.0.0.1", "172.16.0.1"):
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.settimeout(0.05)
                s.connect((remote, 80))
                ip = s.getsockname()[0]
                s.close()
                if not ip.startswith("127.") and ip not in ips:
                    ips.append(ip)
            except Exception:
                pass
    except Exception:
        pass
    if not ips:
        ips = ["127.0.0.1"]
    return ips


def main():
    parser = argparse.ArgumentParser(description="Santapris School System server")
    parser.add_argument("--host", default="0.0.0.0",
                        help="Bind address (default: 0.0.0.0 — all interfaces)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    parser.add_argument("--db", default=None,
                        help="Path to school.db (default: school.db next to this script)")
    args = parser.parse_args()

    if args.db:
        os.environ["SANTAPRIS_DB"] = os.path.abspath(args.db)

    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    from santapris import app  # noqa: F401  (created once, at first import)
    from santapris import config

    all_ips = get_all_local_ips()

    print("=" * 60)
    print("  SANTAPRIS SCHOOL SYSTEM  —  LAN / Wi-Fi Edition (modernized)")
    print("=" * 60)
    print(f"  Local    :  http://localhost:{args.port}")
    for ip in all_ips:
        print(f"  Network  :  http://{ip}:{args.port}")
    print("=" * 60)
    print("  Any device on the same LAN or Wi-Fi can use any")
    print("  Network address above — no internet required.")
    print("=" * 60)
    print("  Admin login:  Martinsmarta  /  Luvahama1995!")
    print("  Teacher login: Teacher  /  Teacher123")
    print("=" * 60)
    print("  ✓ Database NEVER deleted on restart")
    print(f"  ✓ All data saved to {config.DB_PATH.name} on this computer")
    print("  ✓ Every device on the same Wi-Fi/LAN can connect")
    print("  ✓ Backup restore MERGES — existing data is never lost")
    print("  ✓ Real-time sync across all connected devices")
    print("  ✓ Register new users at  /api/register  (POST)")
    print("=" * 60)

    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port,
                loop="asyncio", http="h11", timeout_keep_alive=30)


if __name__ == "__main__":
    main()
