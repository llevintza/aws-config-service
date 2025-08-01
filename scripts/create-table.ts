import { CreateTableCommand, DynamoDBClient, ListTablesCommand, waitUntilTableExists } from '@aws-sdk/client-dynamodb';

const dynamoDBConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
  },
};

const tableName = process.env.DYNAMODB_TABLE_NAME || 'ConfigurationsTable';

async function createTable() {
  const client = new DynamoDBClient(dynamoDBConfig);

  try {
    console.log(`Creating DynamoDB table: ${tableName}`);
    console.log(`Endpoint: ${dynamoDBConfig.endpoint}`);
    console.log(`Region: ${dynamoDBConfig.region}`);

    const createTableCommand = new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S',
        },
        {
          AttributeName: 'tenant',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE',
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'tenant-index',
          KeySchema: [
            {
              AttributeName: 'tenant',
              KeyType: 'HASH',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    const result = await client.send(createTableCommand);
    console.log('Table creation initiated:', result.TableDescription?.TableName);

    console.log('Waiting for table to become active...');
    await waitUntilTableExists(
      {
        client,
        maxWaitTime: 60,
      },
      {
        TableName: tableName,
      }
    );

    console.log(`Table ${tableName} created successfully!`);

    // List tables to confirm
    const listTablesCommand = new ListTablesCommand({});
    const tables = await client.send(listTablesCommand);
    console.log('All tables:', tables.TableNames);

  } catch (error) {
    if (error instanceof Error && error.name === 'ResourceInUseException') {
      console.log(`Table ${tableName} already exists.`);
    } else {
      console.error('Error creating table:', error);
      process.exit(1);
    }
  }
}

createTable();
