import { Module } from '@nestjs/common'
import SupabaseProvider from '@sb/supabase.provider';

@Module({
    providers: [SupabaseProvider]
})
export class SupabaseModule {

}