#!/usr/bin/env bash
echo "========================================================="
echo "  Starting Dullnit V1 Platform (Backend + Frontend)"
echo "========================================================="

if command -v python3 &>/dev/null; then
    python3 run.py
elif command -v python &>/dev/null; then
    python run.py
elif command -v py &>/dev/null; then
    py -3 run.py
else
    echo "[ERROR] Python is not installed or not in PATH."
    exit 1
fi
