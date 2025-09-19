import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import SupabaseProvider from '@shared/providers/supabase.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  providers: [SupabaseProvider]
})
export class AppModule { }
