/**
 * Configuration interface for NoSQL adapters
 */
export interface NoSQLConfig {
  /**
   * Connection timeout in milliseconds
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed operations
   */
  maxRetries?: number;

  /**
   * Enable debug mode
   */
  debug?: boolean;

  /**
   * Custom metadata for adapter-specific config
   */
  metadata?: Record<string, unknown>;
}

/**
 * Cassandra-specific configuration
 */
export interface CassandraConfig extends NoSQLConfig {
  contactPoints: string[];
  localDataCenter: string;
  keyspace: string;
  username?: string;
  password?: string;
  port?: number;
  ssl?: boolean;
  replicationFactor?: number;
}

/**
 * MongoDB-specific configuration
 */
export interface MongoDBConfig extends NoSQLConfig {
  uri: string;
  database: string;
  username?: string;
  password?: string;
  authSource?: string;
  replicaSet?: string;
  ssl?: boolean;
  poolSize?: number;
}
