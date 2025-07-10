@echo off
echo Setting up Freelancer Money Tracker...
echo.

echo Installing Python dependencies...
pip install -r requirements.txt
echo.

echo Installing Node.js dependencies...
npm install
echo.

echo Setup complete! 
echo.
echo To start the application:
echo 1. Start the backend: python main.py
echo 2. Start the frontend: npm run dev
echo.
echo Or run both at once with: npm run dev & python main.py
pause 