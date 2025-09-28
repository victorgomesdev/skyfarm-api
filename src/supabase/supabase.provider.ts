import { Provider } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_PROVIDER = 'SUPABASE_PROVIDER'

const SupabaseProvider: Provider = {
    provide: SUPABASE_PROVIDER,
    inject: [ConfigService],
    useFactory: async (config: ConfigService): Promise<SupabaseClient> => {

        const url = config.get('SB_URL')
        const secretKey = config.get('SB_PRIVATE_KEY')

        return createClient(url, secretKey)
    }
}

export default SupabaseProvider