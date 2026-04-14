#!/usr/bin/env bash
# Install graphify Python dependencies for the knowledge graph pipeline.
set -e
pip3 install -r requirements.txt
echo "graphify dependencies installed"
echo "PYTHONPATH: $(git rev-parse --show-toplevel)/tools"
echo "Test: PYTHONPATH=tools python3 -c \"import graphify; print('OK')\""
