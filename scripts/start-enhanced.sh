#!/bin/bash

# Enhanced ZeroCostxCode Startup Script
# Starts the unified agent system with all Phase 2 enhancements

set -e

echo "🚀 Starting ZeroCostxCode Enhanced - Unified Agent System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "src" ]; then
    print_error "Please run this script from the ZeroCostxCode04 root directory"
    exit 1
fi

# Create necessary directories
print_status "Creating workspace and storage directories..."
mkdir -p workspace storage logs

# Check Python version
print_status "Checking Python version..."
python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
print_success "Python version: $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate
print_success "Virtual environment activated"

# Install/upgrade dependencies
print_status "Installing enhanced backend dependencies..."
pip install -r backend-v2/requirements.txt
print_success "Dependencies installed"

# Check Docker availability
print_status "Checking Docker availability..."
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_success "Docker is available and running"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is installed but not running"
        print_status "Starting Docker daemon..."
        sudo dockerd > logs/docker.log 2>&1 &
        sleep 5
        if docker info &> /dev/null; then
            print_success "Docker daemon started"
            DOCKER_AVAILABLE=true
        else
            print_warning "Could not start Docker daemon - sandboxed execution will use local mode"
            DOCKER_AVAILABLE=false
        fi
    fi
else
    print_warning "Docker not found - sandboxed execution will use local mode"
    DOCKER_AVAILABLE=false
fi

# Start the enhanced backend
print_header "🤖 Starting Unified Agent System Backend"
print_status "Launching unified API server on port 12001..."

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
export WORKSPACE_ROOT="$(pwd)/workspace"
export STORAGE_PATH="$(pwd)/storage"
export DOCKER_AVAILABLE="$DOCKER_AVAILABLE"

# Start the unified API in the background
cd backend-v2
python unified_api.py > ../logs/unified_api.log 2>&1 &
UNIFIED_API_PID=$!
cd ..

# Wait for the API to start
print_status "Waiting for unified API to start..."
sleep 5

# Check if the API is running
if kill -0 $UNIFIED_API_PID 2>/dev/null; then
    print_success "Unified API started successfully (PID: $UNIFIED_API_PID)"
else
    print_error "Failed to start unified API"
    print_status "Check logs/unified_api.log for details"
    exit 1
fi

# Test API health
print_status "Testing API health..."
if curl -s http://localhost:12001/api/v2/system/health > /dev/null; then
    print_success "API health check passed"
else
    print_warning "API health check failed - server may still be starting"
fi

# Start the frontend server
print_header "🌐 Starting Enhanced Frontend"
print_status "Launching frontend server on port 12000..."

# Simple Python HTTP server for frontend
cd frontend-v2
python3 -m http.server 12000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 2

if kill -0 $FRONTEND_PID 2>/dev/null; then
    print_success "Frontend server started successfully (PID: $FRONTEND_PID)"
else
    print_error "Failed to start frontend server"
    exit 1
fi

# Save PIDs for cleanup
echo $UNIFIED_API_PID > logs/unified_api.pid
echo $FRONTEND_PID > logs/frontend.pid

# Display startup summary
print_header "✅ ZeroCostxCode Enhanced - Startup Complete!"
echo ""
echo -e "${CYAN}🌟 System Information:${NC}"
echo "  • Unified Agent System: http://localhost:12001"
echo "  • Enhanced Frontend: http://localhost:12000"
echo "  • API Documentation: http://localhost:12001/docs"
echo "  • WebSocket Transparency: ws://localhost:12001/ws/transparency/{session_id}"
echo ""
echo -e "${CYAN}🎯 Available Execution Modes:${NC}"
echo "  • 🔧 OpenHands Mode: Sandboxed execution with 53% SWE-Bench target"
echo "  • 🤖 Manus AI Mode: Autonomous execution with transparency"
echo "  • ✨ Emergent Mode: Natural language to full-stack apps"
echo "  • 🚀 Hybrid Mode: Best of all three approaches"
echo ""
echo -e "${CYAN}🔍 Key Features:${NC}"
echo "  • Real-time transparency logging"
echo "  • Session management with restore points"
echo "  • Vibe coding for app generation"
echo "  • Multi-agent orchestration"
echo "  • Docker-based sandboxed execution"
echo ""
echo -e "${CYAN}📊 System Status:${NC}"
echo "  • Docker Available: $DOCKER_AVAILABLE"
echo "  • Workspace: $(pwd)/workspace"
echo "  • Storage: $(pwd)/storage"
echo "  • Logs: $(pwd)/logs"
echo ""
echo -e "${YELLOW}💡 Quick Start:${NC}"
echo "  1. Open http://localhost:12000 in your browser"
echo "  2. Try the unified dashboard with all execution modes"
echo "  3. Test vibe coding: 'Create a chat app with React and Node.js'"
echo "  4. Monitor agent actions in the transparency window"
echo "  5. Create restore points to save your progress"
echo ""
echo -e "${GREEN}🎉 Ready to revolutionize your coding experience!${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    print_header "🛑 Shutting down ZeroCostxCode Enhanced..."
    
    if [ -f logs/unified_api.pid ]; then
        UNIFIED_API_PID=$(cat logs/unified_api.pid)
        if kill -0 $UNIFIED_API_PID 2>/dev/null; then
            print_status "Stopping unified API (PID: $UNIFIED_API_PID)..."
            kill $UNIFIED_API_PID
            print_success "Unified API stopped"
        fi
        rm -f logs/unified_api.pid
    fi
    
    if [ -f logs/frontend.pid ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID
            print_success "Frontend server stopped"
        fi
        rm -f logs/frontend.pid
    fi
    
    print_success "ZeroCostxCode Enhanced shutdown complete"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Keep the script running
print_status "System running... Press Ctrl+C to stop"
print_status "Monitoring logs in real-time (Ctrl+C to stop monitoring):"
echo ""

# Monitor logs
tail -f logs/unified_api.log logs/frontend.log 2>/dev/null || {
    print_status "Log monitoring stopped. System continues running in background."
    print_status "Use 'tail -f logs/*.log' to monitor logs manually"
    
    # Keep script alive
    while true; do
        sleep 60
        # Check if processes are still running
        if [ -f logs/unified_api.pid ]; then
            UNIFIED_API_PID=$(cat logs/unified_api.pid)
            if ! kill -0 $UNIFIED_API_PID 2>/dev/null; then
                print_error "Unified API process died unexpectedly"
                break
            fi
        fi
        
        if [ -f logs/frontend.pid ]; then
            FRONTEND_PID=$(cat logs/frontend.pid)
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                print_error "Frontend process died unexpectedly"
                break
            fi
        fi
    done
}