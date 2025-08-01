export interface DynamoDBConfig {
  region: string;
  endpoint?: string;
  tableName: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export const dynamoDBConfig: DynamoDBConfig = {
  region: process.env.AWS_REGION ?? 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000',
  tableName: process.env.DYNAMODB_TABLE_NAME ?? 'ConfigurationsTable',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'dummy',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'dummy',
};
