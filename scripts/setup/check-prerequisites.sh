#!/bin/bash

# Prerequisites Check Script
# Verifies that all required tools are installed for development and CI testing
# 📋 For complete setup instructions, see docs/CONTRIBUTOR_SETUP.md

set -e

echo "🔍 Checking Development Prerequisites"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to check command availability
check_command() {
    local cmd=$1
    local description=$2
    local required_version=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "Checking $description... "
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -1)
        echo -e "${GREEN}✅ Found${NC}"
        echo "  Version: $version"
        
        # Special version checks
        if [ "$cmd" = "node" ] && ! echo "$version" | grep -q "v22\." && ! echo "$version" | grep -q "v2[2-9]\." ; then
            echo -e "  ${YELLOW}⚠️  Warning: CI uses Node.js 22, you have a different version${NC}"
        fi
        
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Not found${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        if [ -n "$required_version" ]; then
            echo "  Required: $required_version"
        fi
    fi
    echo ""
}

# Function to check Docker group membership (Linux only)
check_docker_group() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -n "Checking Docker group membership... "
        if groups | grep -q docker; then
            echo -e "${GREEN}✅ User is in docker group${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  User not in docker group${NC}"
            echo "  Run: sudo usermod -aG docker \$USER && newgrp docker"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        echo ""
    fi
}

# Function to test Docker without sudo
test_docker() {
    if command -v docker &> /dev/null; then
        echo -n "Testing Docker functionality... "
        if docker ps &> /dev/null; then
            echo -e "${GREEN}✅ Docker working${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${RED}❌ Docker not accessible${NC}"
            echo "  Try: sudo usermod -aG docker \$USER && newgrp docker"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        echo ""
    fi
}

# Core development tools
echo "📋 Core Development Tools:"
check_command "node" "Node.js" "v22.x.x"
check_command "yarn" "Yarn" "1.22.x+"

echo ""
echo "🐳 Containerization:"
check_command "docker" "Docker" "Latest"
check_docker_group
test_docker

echo ""
echo "☁️  Cloud Tools:"
check_command "aws" "AWS CLI" "v2.x.x"

echo ""
echo "🔧 Additional Tools:"
check_command "jq" "JSON processor" "Latest"
check_command "gcc" "Build tools" "build-essential package"

echo ""
echo "📊 Summary:"
echo "==========="
echo -e "Total checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

echo ""
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 All prerequisites are installed!${NC}"
    echo ""
    echo "You can now run:"
    echo "  yarn dev          # Start development server"
    echo "  yarn ci:test-local # Test CI pipeline locally"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some prerequisites are missing.${NC}"
    echo ""
    echo -e "${BLUE}📖 For complete setup instructions, see:${NC}"
    echo "  docs/CONTRIBUTOR_SETUP.md"
    echo ""
    echo "Or run the automated setup (Ubuntu/Debian):"
    echo "  ./scripts/install-prerequisites.sh"
    echo ""
fi

# Show OS-specific notes
echo "💡 OS-specific notes:"
case "$OSTYPE" in
    linux-gnu*)
        echo "  - Linux detected"
        echo "  - Make sure to log out/in after adding user to docker group"
        ;;
    darwin*)
        echo "  - macOS detected"
        echo "  - Make sure Docker Desktop is running"
        ;;
    msys*|cygwin*)
        echo "  - Windows detected"
        echo "  - Consider using WSL2 with Ubuntu for best compatibility"
        ;;
esac

exit $FAILED_CHECKS
