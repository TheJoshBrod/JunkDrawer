#!/bin/bash

# On program termination, kill React Server and Flask API
trap 'kill 0' EXIT

# Run React Server
(
    echo "Starting npm server..." 
    npm start
) &
npm_pid=$!
echo "npm process forked with PID $npm_pid"

# Start Flask API
(
    echo "Starting Python API..."
    python3 api/filesystem.py
) &
python_pid=$!

# Do nothing till told to terminate
wait
