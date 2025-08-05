# Contributor Setup Guide

This guide will help any contributor set up their local development environment for the AWS Config Service project. Follow these steps to get your environment ready for development, testing, and CI pipeline validation.

## Table of Contents

- [System Requirements](#system-requirements)
- [Prerequisites Installation](#prerequisites-installation)
  - [Ubuntu/Debian Setup](#ubuntudebian-setup)
  - [macOS Setup](#macos-setup)
  - [Windows Setup](#windows-setup)
- [Project Setup](#project-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## System Requirements

- **Operating System**: Ubuntu 20.04+, macOS 10.15+, or Windows 10+ (with WSL2)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space for dependencies
- **Internet**: Required for downloading dependencies

## Prerequisites Installation

### Ubuntu/Debian Setup

#### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js 22

```bash
# Install Node.js 22 using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v22.x.x
```

#### 3. Install Yarn Package Manager

```bash
# Install Yarn globally
npm install -g yarn

# Verify installation
yarn --version  # Should show 1.22.x or higher
```

#### 4. Install Docker Engine

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Note: You'll need to log out and back in for group changes to take effect
# Or run: newgrp docker
```

#### 5. Install AWS CLI v2

```bash
# Download AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

# Install unzip if not available
sudo apt-get install -y unzip

# Extract and install
unzip awscliv2.zip
sudo ./aws/install

# Clean up
rm -rf awscliv2.zip aws/

# Verify installation
aws --version  # Should show aws-cli/2.x.x
```

#### 6. Install Additional Development Tools

```bash
# Install essential development tools
sudo apt-get install -y jq build-essential

# jq: JSON processor (used in CI scripts)
# build-essential: C/C++ compiler and tools (for native Node.js modules)
```

### macOS Setup

#### 1. Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js 22

```bash
# Install Node.js 22
brew install node@22

# Link the version
brew link node@22

# Verify installation
node --version  # Should show v22.x.x
```

#### 3. Install Yarn

```bash
# Install Yarn
brew install yarn

# Verify installation
yarn --version
```

#### 4. Install Docker Desktop

```bash
# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop from Applications folder
# Or use: open /Applications/Docker.app
```

#### 5. Install AWS CLI v2

```bash
# Install AWS CLI v2
brew install awscli

# Verify installation
aws --version
```

#### 6. Install Additional Tools

```bash
# Install jq for JSON processing
brew install jq
```

### Windows Setup

#### Prerequisites

- Install WSL2 (Windows Subsystem for Linux 2)
- Install Ubuntu from Microsoft Store
- Follow the Ubuntu/Debian setup instructions within WSL2

#### WSL2 Setup

1. **Enable WSL2:**

   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   # Restart your computer
   ```

2. **Install Ubuntu:**
   - Open Microsoft Store
   - Search for "Ubuntu"
   - Install Ubuntu 22.04 LTS

3. **Configure Ubuntu:**
   - Launch Ubuntu from Start Menu
   - Follow the Ubuntu/Debian setup instructions above

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/aws-config-service.git
cd aws-config-service
```

### 2. Install Dependencies

```bash
# Run the setup script (this installs dependencies and sets up git hooks)
./setup.sh
```

Alternatively, if you prefer manual setup:

```bash
# Install project dependencies
yarn install

# Install git hooks
yarn husky install
```

### 3. Configure Git (if not already done)

```bash
# Set your Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Verification

### 1. Verify All Prerequisites

Run this verification script to check all installations:

```bash
echo "=== Checking Prerequisites ==="

# Node.js version
echo "Node.js version:"
node --version

# Yarn version
echo "Yarn version:"
yarn --version

# Docker version
echo "Docker version:"
docker --version

# AWS CLI version
echo "AWS CLI version:"
aws --version

# jq version
echo "jq version:"
jq --version

echo "=== All checks complete ==="
```

### 2. Test Docker Without Sudo (Linux only)

```bash
# Test Docker (should work without sudo)
docker run hello-world

# If this fails, you may need to log out and back in, or run:
# newgrp docker
```

### 3. Test Project Setup

```bash
# Navigate to project directory
cd aws-config-service

# Install dependencies (if not done during setup)
yarn install

# Run type checking
yarn type-check

# Run linting
yarn lint

# Run formatting check
yarn format:check

# Build the project
yarn build
```

### 4. Test Local Development

```bash
# Start development server
yarn dev

# In another terminal, test the health endpoint
curl http://localhost:3000/health

# Stop the server with Ctrl+C
```

### 5. Test Local CI Pipeline

⚠️ **Before running local CI tests, ensure all prerequisites above are installed!**

```bash
# Run the complete local CI pipeline simulation
yarn ci:test-local

# This will test:
# - Code quality checks
# - Docker builds
# - DynamoDB Local integration
# - Container health checks
```

## Troubleshooting

### Common Issues

#### Docker Permission Denied (Linux)

```bash
# If you get "permission denied" when running docker commands:

# Add user to docker group
sudo usermod -aG docker $USER

# Apply the group change (choose one):
# Option 1: Log out and back in
# Option 2: Run this command
newgrp docker

# Option 3: Restart your terminal/session
```

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# If not version 22.x.x, reinstall Node.js following the instructions above
# or use a version manager like nvm:

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 22
nvm use 22
```

#### Yarn Not Found

```bash
# If yarn command is not found:
npm install -g yarn

# Or on macOS:
brew install yarn
```

#### AWS CLI Not Found

```bash
# Check if AWS CLI is in PATH
which aws

# If not found, reinstall following the instructions above
# Make sure /usr/local/bin is in your PATH
echo $PATH
```

#### Port 3000 Already in Use

```bash
# Check what's using port 3000
yarn port:check

# Free up port 3000
yarn port:free

# Or manually:
sudo lsof -ti:3000 | xargs sudo kill -9
```

#### Git Hooks Not Working

```bash
# Reinstall git hooks
yarn husky install

# Make sure the setup script was run
./setup.sh
```

### Getting Help

If you encounter issues not covered here:

1. **Check existing documentation:**
   - [SERVICE_MANAGEMENT.md](./SERVICE_MANAGEMENT.md) - Service management
   - [DEBUGGING.md](./DEBUGGING.md) - Debugging guide
   - [LOCAL_CI_TESTING.md](./LOCAL_CI_TESTING.md) - CI testing

2. **Search for existing issues** in the GitHub repository

3. **Create a new issue** with:
   - Your operating system and version
   - Output of the verification commands above
   - Complete error messages
   - Steps you've already tried

## Next Steps

After completing the setup:

1. **Read the development guides:**
   - [README.md](../README.md) - Project overview and quick start
   - [SERVICE_MANAGEMENT.md](./SERVICE_MANAGEMENT.md) - Running the service
   - [DEBUGGING.md](./DEBUGGING.md) - Debugging techniques

2. **Test local CI before pushing:**
   - [LOCAL_CI_TESTING.md](./LOCAL_CI_TESTING.md) - Local CI testing

3. **Start developing:**

   ```bash
   # Start development server
   yarn dev

   # Open another terminal for testing
   curl http://localhost:3000/health
   ```

4. **Before your first commit:**

   ```bash
   # Run all quality checks
   yarn pre-commit

   # Run local CI simulation
   yarn ci:test-local
   ```

Happy coding! 🚀
