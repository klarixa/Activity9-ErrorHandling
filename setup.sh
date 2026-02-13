#!/bin/bash

# Error Handling Discovery Challenge Setup
# Activity 09: Build resilient applications with robust error handling

echo "🎯 Setting up Error Handling Discovery Challenge..."
echo ""

if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the activity-09-error-handling directory"
    exit 1
fi

echo "📚 Discovery Challenge Overview:"
echo "   🎯 Master professional error handling and resilience patterns"
echo "   🛡️ Focus: Error boundaries, retry logic, user experience"
echo "   🔬 Method: Fault tolerance and recovery exploration"
echo ""

echo "🎓 DISCOVERY LEARNING OBJECTIVES:"
echo "   1. Research different error types and handling strategies"
echo "   2. Explore retry mechanisms and exponential backoff"
echo "   3. Investigate user-friendly error messaging"
echo "   4. Master graceful degradation patterns"
echo "   5. Build resilient, fault-tolerant applications"
echo ""

if command -v python3 &> /dev/null; then
    echo "🚀 Starting server at: http://localhost:8000"
    python3 -m http.server 8000
else
    echo "❌ Python not found. Use VS Code Live Server or similar."
fi

echo "✨ Build unbreakable applications! 🎯"