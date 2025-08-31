#!/bin/bash

# Frontend Test Runner Script
# This script runs all frontend tests with various options

set -e  # Exit on any error

echo "🧪 Frontend Test Runner"
echo "======================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Parse command line arguments
COVERAGE=false
WATCH=false
VERBOSE=false
BAIL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --bail)
            BAIL=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --coverage    Generate test coverage report"
            echo "  --watch       Run tests in watch mode"
            echo "  --verbose     Run tests with verbose output"
            echo "  --bail        Stop on first test failure"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Build Jest command
JEST_CMD="npm run test"

if [ "$COVERAGE" = true ]; then
    JEST_CMD="npm run test:coverage"
    print_status "Running tests with coverage..."
elif [ "$WATCH" = true ]; then
    JEST_CMD="npm run test:watch"
    print_status "Running tests in watch mode..."
else
    print_status "Running all tests..."
fi

# Add Jest flags
JEST_FLAGS=""

if [ "$VERBOSE" = true ]; then
    JEST_FLAGS="$JEST_FLAGS --verbose"
fi

if [ "$BAIL" = true ]; then
    JEST_FLAGS="$JEST_FLAGS --bail"
fi

# Run the tests
echo ""
print_status "Executing: $JEST_CMD $JEST_FLAGS"
echo ""

if [ -n "$JEST_FLAGS" ]; then
    $JEST_CMD -- $JEST_FLAGS
else
    $JEST_CMD
fi

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    print_success "All tests passed! ✅"
    
    if [ "$COVERAGE" = true ]; then
        print_status "Coverage report generated in ./coverage/"
        
        # Check if coverage meets minimum thresholds
        if command -v node >/dev/null 2>&1; then
            node -e "
                try {
                    const coverage = require('./coverage/coverage-summary.json');
                    const total = coverage.total;
                    const thresholds = { lines: 70, functions: 70, branches: 70, statements: 70 };
                    
                    console.log('\n📊 Coverage Summary:');
                    console.log('===================');
                    Object.entries(total).forEach(([key, value]) => {
                        const pct = value.pct;
                        const threshold = thresholds[key] || 0;
                        const status = pct >= threshold ? '✅' : '❌';
                        console.log(\`\${key.padEnd(12)}: \${pct}% \${status}\`);
                    });
                } catch (e) {
                    console.log('Coverage summary not available');
                }
            "
        fi
    fi
else
    echo ""
    print_error "Tests failed! ❌"
    exit 1
fi
