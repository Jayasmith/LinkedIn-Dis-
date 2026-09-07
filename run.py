"""
Dullnit V1 - Master Development Runner
Starts both the FastAPI backend and Vite frontend with a single command.

Usage:
    python run.py
"""

import os
import sys
import subprocess
import time
import webbrowser

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def find_python():
    """Locate the Python executable, preferring the local virtual environment."""
    venv_win = os.path.join(ROOT_DIR, "venv", "Scripts", "python.exe")
    venv_unix = os.path.join(ROOT_DIR, "venv", "bin", "python")
    dot_venv_win = os.path.join(ROOT_DIR, ".venv", "Scripts", "python.exe")
    dot_venv_unix = os.path.join(ROOT_DIR, ".venv", "bin", "python")

    for path in [venv_win, dot_venv_win, venv_unix, dot_venv_unix]:
        if os.path.isfile(path):
            return path
    return sys.executable

def main():
    py_exec = find_python()

    print("\n" + "=" * 65)
    print("  🚀 Starting Dullnit V1 Platform (Backend + Frontend)")
    print("=" * 65)
    print(f"  [*] Python Runtime : {py_exec}")
    print(f"  [*] Project Root   : {ROOT_DIR}")

    # Verify frontend dependencies
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.isdir(node_modules):
        print("  [*] Installing frontend dependencies (npm install)...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, shell=True)

    processes = []

    try:
        # 1. Launch FastAPI Backend
        print("  [1/2] Launching FastAPI Backend on http://localhost:8000 ...")
        backend_cmd = [
            py_exec,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            "8000",
            "--reload",
        ]
        backend_proc = subprocess.Popen(backend_cmd, cwd=ROOT_DIR)
        processes.append(backend_proc)

        # 2. Launch Vite Frontend
        print("  [2/2] Launching Vite Frontend on http://localhost:5173 ...")
        frontend_cmd = ["npm", "run", "dev", "--", "--host"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR, shell=True)
        processes.append(frontend_proc)

        print("\n" + "-" * 65)
        print("  ✨ All systems online:")
        print("  ➜  Frontend UI      : http://localhost:5173")
        print("  ➜  Backend API      : http://localhost:8000")
        print("  ➜  Swagger API Docs : http://localhost:8000/docs")
        print("  ➜  Stop Services    : Press Ctrl+C")
        print("-" * 65 + "\n")

        # Open browser to frontend after short delay
        time.sleep(2)
        try:
            webbrowser.open("http://localhost:5173")
        except Exception:
            pass

        # Keep parent script alive while child processes run
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("  [!] Backend process stopped.")
                break
            if frontend_proc.poll() is not None:
                print("  [!] Frontend process stopped.")
                break

    except KeyboardInterrupt:
        print("\n  [*] Gracefully shutting down Dullnit V1 services...")
    finally:
        for p in processes:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass
        print("  ✓ All services stopped cleanly.\n")

if __name__ == "__main__":
    main()
