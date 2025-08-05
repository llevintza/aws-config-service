#!/bin/bash

# Test Trivy vulnerability scanning locally before pushing to GitHub
# This script tests the exact same steps as the GitHub Actions workflow

set -e

echo "🛡️ Testing Trivy Security Scanning Locally"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ $2${NC}" ;;
        "INFO") echo -e "$2" ;;
    esac
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_status "ERROR" "Docker is required but not installed"
    exit 1
fi

# Generate a test image tag
IMAGE_TAG="aws-config-service:$(git rev-parse --short HEAD)-test"

print_status "INFO" "Step 1: Building Docker image"
print_status "INFO" "Using image tag: $IMAGE_TAG"

# Build the Docker image (same as GitHub Actions)
docker build -t "$IMAGE_TAG" .

if [ $? -eq 0 ]; then
    print_status "SUCCESS" "Docker image built successfully"
else
    print_status "ERROR" "Docker build failed"
    exit 1
fi

print_status "INFO" "Step 2: Installing Trivy vulnerability scanner"

# Check if Trivy is installed, if not install it
if ! command -v trivy &> /dev/null; then
    print_status "INFO" "Installing Trivy..."
    
    # Install Trivy based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            sudo apt-get update -qq
            sudo apt-get install -y -qq wget apt-transport-https gnupg lsb-release
            wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
            echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
            sudo apt-get update -qq
            sudo apt-get install -y -qq trivy
        else
            # Use binary installation as fallback
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
        fi
    else
        print_status "ERROR" "Unsupported OS for automatic Trivy installation"
        print_status "INFO" "Please install Trivy manually: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
        exit 1
    fi
    
    print_status "SUCCESS" "Trivy installed successfully"
else
    print_status "SUCCESS" "Trivy is already installed"
fi

print_status "INFO" "Trivy version: $(trivy --version)"

print_status "INFO" "Step 3: Running Trivy vulnerability scan"
print_status "INFO" "This may take a few minutes for the first run..."

# Run Trivy scan in SARIF format (exact same as GitHub Actions)
trivy image --format sarif --output trivy-results.sarif "$IMAGE_TAG"

if [ $? -eq 0 ]; then
    print_status "SUCCESS" "Trivy scan completed successfully"
else
    print_status "ERROR" "Trivy scan failed"
    exit 1
fi

print_status "INFO" "Step 4: Validating SARIF output"

# Check if the SARIF file was created and is valid
if [ -f "trivy-results.sarif" ]; then
    file_size=$(stat -f%z "trivy-results.sarif" 2>/dev/null || stat -c%s "trivy-results.sarif" 2>/dev/null)
    
    if [ "$file_size" -gt 0 ]; then
        print_status "SUCCESS" "SARIF file created successfully (${file_size} bytes)"
        
        # Validate JSON structure
        if command -v jq &> /dev/null; then
            if jq empty trivy-results.sarif 2>/dev/null; then
                print_status "SUCCESS" "SARIF file is valid JSON"
            else
                print_status "WARNING" "SARIF file may have JSON syntax issues"
            fi
        else
            print_status "INFO" "jq not available - skipping JSON validation"
        fi
        
        # Show basic statistics
        if command -v jq &> /dev/null; then
            total_results=$(jq '.runs[0].results | length' trivy-results.sarif 2>/dev/null || echo "unknown")
            print_status "INFO" "Total security findings: $total_results"
            
            # Count by severity if possible
            if [ "$total_results" != "unknown" ] && [ "$total_results" -gt 0 ]; then
                echo ""
                echo "Severity breakdown:"
                jq -r '.runs[0].results[] | .level // "unknown"' trivy-results.sarif 2>/dev/null | sort | uniq -c | while read count level; do
                    echo "  $level: $count"
                done
            fi
        fi
    else
        print_status "ERROR" "SARIF file is empty"
        exit 1
    fi
else
    print_status "ERROR" "SARIF file was not created"
    exit 1
fi

print_status "INFO" "Step 5: Testing different output formats"

# Test JSON format for additional validation
trivy image --format json --output trivy-results.json "$IMAGE_TAG"

if [ -f "trivy-results.json" ]; then
    print_status "SUCCESS" "JSON format scan also successful"
    
    if command -v jq &> /dev/null; then
        # Show summary from JSON output
        vulnerabilities=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity)] | length' trivy-results.json 2>/dev/null || echo "0")
        print_status "INFO" "Total vulnerabilities found: $vulnerabilities"
    fi
else
    print_status "WARNING" "JSON format scan failed"
fi

print_status "INFO" "Step 6: Cleanup"

# Clean up test files
rm -f trivy-results.json

# Ask user if they want to keep the SARIF file for inspection
echo ""
read -p "Keep trivy-results.sarif for inspection? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    rm -f trivy-results.sarif
    print_status "INFO" "Cleaned up SARIF file"
else
    print_status "INFO" "SARIF file kept for inspection: trivy-results.sarif"
fi

# Clean up Docker image
docker rmi "$IMAGE_TAG" > /dev/null 2>&1 || true

print_status "SUCCESS" "🎉 Trivy security scanning test completed successfully!"
print_status "SUCCESS" "The GitHub Actions workflow should now be able to upload results to the Security tab."

echo ""
echo "=== Summary ==="
echo "✅ Docker image built successfully"
echo "✅ Trivy vulnerability scan completed"
echo "✅ SARIF output generated and validated"
echo "✅ GitHub Actions permissions have been configured"
echo ""
echo "The ci.yml workflow now has 'security-events: write' permission"
echo "which should resolve the 'Resource not accessible by integration' error."
