@echo off
title FACECAN Ponto Digital V2
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo Falha no npm install.
    pause
    exit /b 1
  )
)
if not exist .env.local copy .env.example .env.local
echo.
echo FACECAN V2 iniciando em http://localhost:3000
echo.
call npm run dev
pause
