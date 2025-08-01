#!/bin/bash

# DynamoDB Table Creation Script
# This script creates the ConfigurationsTable in DynamoDB Local

set -e

ENDPOINT=${DYNAMODB_ENDPOINT:-"http://localhost:8000"}
REGION=${AWS_REGION:-"us-east-1"}
TABLE_NAME=${DYNAMODB_TABLE_NAME:-"ConfigurationsTable"}

echo "Creating DynamoDB table: $TABLE_NAME"
echo "Endpoint: $ENDPOINT"
echo "Region: $REGION"

# Create the table
aws dynamodb create-table \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
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

echo "Waiting for table to become active..."
aws dynamodb wait table-exists \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --table-name "$TABLE_NAME"

echo "Table $TABLE_NAME created successfully!"

# List tables to confirm
echo "Listing all tables:"
aws dynamodb list-tables \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION"
