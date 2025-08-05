#!/bin/bash

# Prerequisites Installation Script for Ubuntu 24.04
# This script installs all required dependencies for local CI testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step "Starting prerequisites installation for Ubuntu 24.04..."
echo "========================================================"

# Update package list
print_step "Updating package list..."
sudo apt-get update

# Install curl and wget if not present
print_step "Installing basic tools..."
sudo apt-get install -y curl wget gpg lsb-release

# 1. Install Docker
print_step "Installing Docker..."

# Remove any old Docker installations
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list with Docker repo
sudo apt-get update

# Install Docker Engine
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

print_success "Docker installed successfully"

# 2. Install Node.js 22
print_step "Installing Node.js 22..."

# Remove any existing NodeSource repository
sudo rm -f /etc/apt/sources.list.d/nodesource.list

# Install Node.js 22 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

print_success "Node.js 22 installed successfully"

# 3. Install Yarn
print_step "Installing Yarn..."

# Install Yarn via npm
sudo npm install -g yarn

print_success "Yarn installed successfully"

# 4. Install AWS CLI
print_step "Installing AWS CLI..."

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt-get install -y unzip
unzip awscliv2.zip
sudo ./aws/install

# Cleanup
rm -rf aws awscliv2.zip

print_success "AWS CLI installed successfully"

# 5. Install additional useful tools
print_step "Installing additional tools..."

sudo apt-get install -y \
    jq \
    git \
    build-essential \
    python3 \
    python3-pip

print_success "Additional tools installed successfully"

# Verify installations
print_step "Verifying installations..."

echo "Checking Docker..."
docker --version

echo "Checking Node.js..."
node --version

echo "Checking Yarn..."
yarn --version

echo "Checking AWS CLI..."
aws --version

echo "Checking jq..."
jq --version

print_success "All prerequisites installed successfully!"

echo ""
print_warning "IMPORTANT: You need to log out and log back in (or restart your terminal)"
print_warning "for Docker permissions to take effect, or run:"
print_warning "newgrp docker"

echo ""
echo "After logging back in, you can test with:"
echo "docker run hello-world"

echo ""
print_success "Installation completed! 🎉"
