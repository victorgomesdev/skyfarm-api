import { CoreModule } from '@core/core.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    CoreModule,
    HttpModule.registerAsync({
      useFactory: async (config: ConfigService)=> {
        return {
          baseURL: config.get('CP_DATA_URL') + '/api/v1'
        }
      },
      inject: [ConfigService],
      global: true
    })
  ]
})
export class AppModule { }
