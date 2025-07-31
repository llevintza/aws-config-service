# DynamoDB Setup and Migration Guide

This guide provides step-by-step instructions for setting up DynamoDB as the data source for the AWS Config Service and migrating data from the existing JSON file format.

## Overview

The service has been enhanced to support both file-based and DynamoDB-based configuration storage through a hybrid service layer. You can switch between the two by setting the `USE_DYNAMODB` environment variable.

## Architecture

### DynamoDB Table Structure

**Table Name**: `ConfigurationsTable`

**Primary Key**:

- **Partition Key (pk)**: `tenant#cloudRegion#service#configName` (String)
- **Sort Key (sk)**: `config` (String)

**Global Secondary Index**:

- **Index Name**: `tenant-index`
- **Partition Key**: `tenant` (String)

**Attributes**:

- `pk`: Primary key combining all identifiers
- `sk`: Sort key (always "config")
- `tenant`: Tenant identifier
- `cloudRegion`: AWS region (e.g., us-east-1)
- `service`: AWS service name (e.g., api-gateway, lambda)
- `configName`: Configuration parameter name
- `value`: Configuration value (string or number)
- `unit`: Optional unit specification
- `description`: Optional description
- `ttl`: Optional TTL for cache expiration

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **AWS CLI** installed (for manual table operations)
3. **Node.js and Yarn** for running migration scripts

## Setup Instructions

### Step 1: Install Dependencies

First, install the new AWS SDK dependencies:

```bash
yarn install
```

### Step 2: Start DynamoDB Local

You have two options for running DynamoDB:

#### Option A: DynamoDB Only

```bash
yarn docker:dynamodb
```

#### Option B: Full Stack with DynamoDB

```bash
yarn docker:up
```

This will start:

- DynamoDB Local on port 8000
- DynamoDB Admin UI on port 8001
- Your application on port 3000 (if using Option B)

### Step 3: Create the DynamoDB Table

#### Using the TypeScript Script (Recommended)

```bash
yarn dynamodb:create-table
```

#### Using the Bash Script

```bash
./scripts/create-dynamodb-table.sh
```

#### Manual Creation with AWS CLI

```bash
aws dynamodb create-table \
  --endpoint-url "http://localhost:8000" \
  --region "us-east-1" \
  --table-name "ConfigurationsTable" \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=tenant,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=tenant-index,KeySchema='[{AttributeName=tenant,KeyType=HASH}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Step 4: Migrate Data from JSON to DynamoDB

Run the migration script to transfer your existing configuration data:

```bash
yarn dynamodb:migrate
```

This script will:

1. Read the existing `data/configurations.json` file
2. Transform the nested structure into DynamoDB items
3. Insert all configurations into the DynamoDB table
4. Report the number of items migrated

### Step 5: Configure the Application

Set the following environment variables to use DynamoDB:

```bash
export USE_DYNAMODB=true
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
export DYNAMODB_TABLE_NAME=ConfigurationsTable
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy
```

Or add them to your `.env` file:

```env
USE_DYNAMODB=true
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=ConfigurationsTable
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
```

### Step 6: Start the Application

```bash
yarn build
yarn start
```

Or for development:

```bash
yarn dev
```

## Verification

### 1. Check Table Creation

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1
```

### 2. Verify Data Migration

```bash
aws dynamodb scan --endpoint-url http://localhost:8000 --region us-east-1 --table-name ConfigurationsTable
```

### 3. Test API Endpoints

Get a specific configuration:

```bash
curl http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit
```

Get all configurations:

```bash
curl http://localhost:3000/config
```

### 4. Use DynamoDB Admin UI

Navigate to http://localhost:8001 to use the web-based DynamoDB admin interface.

## Configuration Options

### Environment Variables

| Variable                | Default                 | Description                      |
| ----------------------- | ----------------------- | -------------------------------- |
| `USE_DYNAMODB`          | `false`                 | Enable DynamoDB backend          |
| `AWS_REGION`            | `us-east-1`             | AWS region                       |
| `DYNAMODB_ENDPOINT`     | `http://localhost:8000` | DynamoDB endpoint                |
| `DYNAMODB_TABLE_NAME`   | `ConfigurationsTable`   | Table name                       |
| `AWS_ACCESS_KEY_ID`     | `dummy`                 | AWS access key (dummy for local) |
| `AWS_SECRET_ACCESS_KEY` | `dummy`                 | AWS secret key (dummy for local) |

### Switching Between Backends

To switch back to file-based storage:

```bash
export USE_DYNAMODB=false
```

or

```bash
unset USE_DYNAMODB
```

## Troubleshooting

### Common Issues

1. **Table Already Exists Error**
   - The script will handle this gracefully and continue

2. **Connection Refused**
   - Ensure DynamoDB Local is running on port 8000
   - Check if Docker containers are up: `docker ps`

3. **Migration Fails**
   - Verify the `data/configurations.json` file exists
   - Check file permissions
   - Ensure DynamoDB table exists

4. **Application Returns Empty Results**
   - Verify `USE_DYNAMODB=true` is set
   - Check if data migration completed successfully
   - Ensure table has data: `aws dynamodb scan --endpoint-url http://localhost:8000 --table-name ConfigurationsTable`

### Docker Commands

```bash
# Start only DynamoDB
docker-compose -f docker-compose.dynamodb.yml up -d

# Stop DynamoDB
docker-compose -f docker-compose.dynamodb.yml down

# View logs
docker-compose logs dynamodb-local

# Reset DynamoDB data
docker-compose -f docker-compose.dynamodb.yml down -v
```

### AWS CLI Configuration

For local DynamoDB, configure AWS CLI with dummy credentials:

```bash
aws configure set aws_access_key_id dummy
aws configure set aws_secret_access_key dummy
aws configure set region us-east-1
```

## Production Considerations

When deploying to production with real AWS DynamoDB:

1. Remove the `endpoint` configuration to use real DynamoDB
2. Set proper AWS credentials via IAM roles or environment variables
3. Adjust table capacity settings based on expected load
4. Consider using DynamoDB on-demand billing instead of provisioned capacity
5. Set up proper monitoring and alarms
6. Enable point-in-time recovery for production tables
7. Configure appropriate TTL settings if needed

### Example Production Configuration

```env
USE_DYNAMODB=true
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=ConfigurationsTable-prod
# Remove DYNAMODB_ENDPOINT to use real AWS DynamoDB
# Use IAM roles instead of hardcoded credentials
```

## Data Structure Comparison

### JSON File Structure

```json
{
  "tenant1": {
    "cloud": {
      "us-east-1": {
        "services": {
          "api-gateway": {
            "configs": {
              "rate-limit": {
                "value": 1000,
                "unit": "requests/minute",
                "description": "API Gateway rate limiting"
              }
            }
          }
        }
      }
    }
  }
}
```

### DynamoDB Item Structure

```json
{
  "pk": "tenant1#us-east-1#api-gateway#rate-limit",
  "sk": "config",
  "tenant": "tenant1",
  "cloudRegion": "us-east-1",
  "service": "api-gateway",
  "configName": "rate-limit",
  "value": 1000,
  "unit": "requests/minute",
  "description": "API Gateway rate limiting"
}
```

This flattened structure allows for efficient querying while maintaining all the original data relationships.
