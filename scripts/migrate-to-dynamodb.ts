import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationData, DynamoDBConfigItem } from '../src/types/config';

const dynamoDBConfig = {
  region: process.env.AWS_REGION ?? 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'dummy',
  },
};

const tableName = process.env.DYNAMODB_TABLE_NAME ?? 'ConfigurationsTable';

async function migrateData() {
  const client = new DynamoDBClient(dynamoDBConfig);
  const docClient = DynamoDBDocumentClient.from(client);

  try {
    // Read JSON configuration file
    const configPath = path.join(process.cwd(), 'data', 'configurations.json');
    console.log(`Reading configuration from: ${configPath}`);

    const rawData = fs.readFileSync(configPath, 'utf-8');
    const configData: ConfigurationData = JSON.parse(rawData);

    console.log('Starting data migration to DynamoDB...');
    let itemCount = 0;

    // Iterate through the nested structure and create DynamoDB items
    for (const [tenantName, tenant] of Object.entries(configData)) {
      console.log(`Processing tenant: ${tenantName}`);

      for (const [cloudRegionName, cloudRegion] of Object.entries(tenant.cloud)) {
        console.log(`  Processing cloud region: ${cloudRegionName}`);

        for (const [serviceName, service] of Object.entries(cloudRegion.services)) {
          console.log(`    Processing service: ${serviceName}`);

          for (const [configName, config] of Object.entries(service.configs)) {
            const pk = `${tenantName}#${cloudRegionName}#${serviceName}#${configName}`;

            const item: DynamoDBConfigItem = {
              pk,
              sk: 'config',
              tenant: tenantName,
              cloudRegion: cloudRegionName,
              service: serviceName,
              configName,
              value: config.value,
              unit: config.unit,
              description: config.description,
            };

            const command = new PutCommand({
              TableName: tableName,
              Item: item,
            });

            try {
              await docClient.send(command);
              itemCount++;
              console.log(`      Migrated: ${configName} = ${config.value}`);
            } catch (error) {
              console.error(`      Error migrating config ${configName}:`, error);
            }
          }
        }
      }
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`Total items migrated: ${itemCount}`);

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

export { migrateData };
