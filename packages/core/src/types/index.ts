export interface WalletModuleOptions {
  database: DatabaseConfig;
  nosql?: NoSQLConfig;
  cache: CacheConfig;
  queue?: QueueConfig;
  security: SecurityConfig;
  transaction: TransactionConfig;
  kyc: KYCConfig;
  features?: FeatureFlags;
}

export interface DatabaseConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite';
  url: string;
}

export interface NoSQLConfig {
  provider: 'cassandra' | 'mongodb';
  contactPoints?: string[];
  connectionString?: string;
  keyspace?: string;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export interface SecurityConfig {
  enableHashValidation: boolean;
  hashAlgorithm: 'sha256' | 'sha512';
}

export interface TransactionConfig {
  defaultStrategy: 'individual' | 'business';
  enableIdempotency: boolean;
  idempotencyWindow: number;
}

export interface KYCConfig {
  tierConfig: TierConfiguration;
  profiles: ('individual' | 'corporate' | 'group')[];
}

export interface TierConfiguration {
  tier1: TierConfig;
  tier2: TierConfig;
  tier3: TierConfig;
}

export interface TierConfig {
  name: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  cumulativeBalance: number;
  requiredDocuments: string[];
}

export interface FeatureFlags {
  multiCurrency?: boolean;
  qrCodeTransfer?: boolean;
  phoneTransfer?: boolean;
}
