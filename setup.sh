#!/bin/bash

echo "Setting up SlyyFoxx Media application..."

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup frontend
cd frontend
npm install
cd ..

echo "Setup complete!"
echo "To run the application:"
echo "1. Backend: cd backend && source venv/bin/activate && python main.py"
echo "2. Frontend: cd frontend && npm run dev"