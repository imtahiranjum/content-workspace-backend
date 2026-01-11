import { Global, Module } from '@nestjs/common';
import { DatabaseConfig } from './database.config';
import { ConfigType, ConfigModule as NestConfigModule } from '@nestjs/config';
import { authentication, database, server } from './env.config';
import configValidation from './env.config.validation';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [server, authentication, database],
      validationSchema: configValidation,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [database.KEY],
      useFactory: (db: ConfigType<typeof database>) => {
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          synchronize: db.sync,
          ssl: db.ssl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
        };
      },
    }),
  ],
  providers: [DatabaseConfig],
  exports: [DatabaseConfig],
})
export class CustomConfigModule {}
