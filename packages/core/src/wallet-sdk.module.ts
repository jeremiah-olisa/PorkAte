import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { KYCModule } from './modules/kyc/kyc.module';
import { LienModule } from './modules/lien/lien.module';
import { AuthModule } from './modules/auth/auth.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PrismaModule } from './providers/database/prisma.module';
import { RedisModule } from './providers/cache/redis.module';
import { WALLET_CONFIG } from './constants';
import { WalletModuleOptions } from './types';

@Global()
@Module({})
export class WalletSdkModule {
  static forRoot(options: WalletModuleOptions): DynamicModule {
    return {
      module: WalletSdkModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule.forRoot(options.database),
        RedisModule.forRoot(options.cache),
        WalletModule,
        TransactionModule,
        KYCModule,
        LienModule,
        AuthModule,
        LedgerModule,
      ],
      providers: [
        {
          provide: WALLET_CONFIG,
          useValue: options,
        },
      ],
      exports: [
        WALLET_CONFIG,
        PrismaModule,
        RedisModule,
        WalletModule,
        TransactionModule,
        KYCModule,
        LienModule,
        AuthModule,
        LedgerModule,
      ],
    };
  }

  static forRootAsync(options: any): DynamicModule {
    return {
      module: WalletSdkModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ...(options.imports || []),
      ],
      providers: [
        {
          provide: WALLET_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }
}
