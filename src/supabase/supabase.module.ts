import { Module } from '@nestjs/common'
import SupabaseProvider from '@sb/supabase.provider';

@Module({
    providers: [SupabaseProvider],
    exports: [SupabaseProvider]
})
export class SupabaseModule {

}