@echo off
echo Starting PAA Question Miner...
start "" http://localhost:3131
node "%~dp0paa-server.js"
pause
