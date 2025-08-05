# Act - GitHub Actions Local Testing

## Installation

### On Ubuntu/Debian:

```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### On macOS:

```bash
brew install act
```

### On Windows:

```bash
choco install act-cli
```

## Usage

### Test specific job:

```bash
# Test the build-and-test job
act -j build-and-test

# Test the docker job
act -j docker

# Test code-quality job
act -j code-quality
```

### Test with specific event:

```bash
# Test push event
act push

# Test pull request event
act pull_request
```

### Test with secrets:

```bash
# Create .secrets file with:
# GITHUB_TOKEN=your_token_here

act -s GITHUB_TOKEN
```

### Test with custom Docker image:

```bash
# Use Ubuntu 22.04 image
act -P ubuntu-latest=catthehacker/ubuntu:act-22.04
```

### Dry run (see what would run):

```bash
act --dry-run
```

## Configuration

Create `.actrc` file in project root:

```
-P ubuntu-latest=catthehacker/ubuntu:act-22.04
--container-architecture linux/amd64
```

## Common Issues and Solutions

1. **Docker permissions**: Run with `sudo` or add user to docker group
2. **Large images**: Use `catthehacker/ubuntu:act-*` images for faster testing
3. **Service containers**: Act has limited support, test individual components instead
4. **Secrets**: Use `.secrets` file or environment variables

## Example Commands

```bash
# Quick test of main jobs
act -j code-quality
act -j build-and-test

# Test specific workflow file
act -W .github/workflows/ci.yml

# Test with verbose output
act -v

# Test with custom environment
act --env-file .env.test
```
