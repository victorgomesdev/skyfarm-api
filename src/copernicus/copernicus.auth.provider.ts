import { Injectable, OnApplicationBootstrap, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable({scope: Scope.REQUEST})
export class CopernicusAuth implements OnApplicationBootstrap {

    private token!: string
    private expiration!: number

    constructor(private config: ConfigService) { }

    async onApplicationBootstrap(): Promise<void> {
        //await this.refreshToken() Remover o comentário
        this.token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3NTgzOTA3MTAsImlhdCI6MTc1ODM5MDExMCwianRpIjoiNDgyMmYzOGUtN2NjOS00YTU3LWE0OTktMDdlYTJkNjIzNzkxIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5kYXRhc3BhY2UuY29wZXJuaWN1cy5ldS9hdXRoL3JlYWxtcy9DRFNFIiwic3ViIjoiNmJlMWVkNjYtM2VmNS00OGU2LTlkZTQtOTZiZWEyMzI1NmQzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2gtOWJlMzAyMDYtNDFhMy00NGM5LTgzYjgtYjRlZWE0ZGRmMjczIiwic2NvcGUiOiJlbWFpbCBwcm9maWxlIHVzZXItY29udGV4dCIsImNsaWVudEhvc3QiOiIxMzguMC42NC42NCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwib3JnYW5pemF0aW9ucyI6WyJkZWZhdWx0LTY4NTczOTc3LTgyNmYtNDM5Yi1hYzAyLWU1NWU1OGNlZGZhMiJdLCJ1c2VyX2NvbnRleHRfaWQiOiI5Y2YxYzM0Zi1iMjVjLTRjNGEtOWM4OC1jZDEzY2Y1NWUxNmYiLCJjb250ZXh0X3JvbGVzIjp7fSwiY29udGV4dF9ncm91cHMiOlsiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9jb3Blcm5pY3VzX2dlbmVyYWwvIiwiL29yZ2FuaXphdGlvbnMvZGVmYXVsdC02ODU3Mzk3Ny04MjZmLTQzOWItYWMwMi1lNTVlNThjZWRmYTIvIl0sInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1zaC05YmUzMDIwNi00MWEzLTQ0YzktODNiOC1iNGVlYTRkZGYyNzMiLCJ1c2VyX2NvbnRleHQiOiJkZWZhdWx0LTY4NTczOTc3LTgyNmYtNDM5Yi1hYzAyLWU1NWU1OGNlZGZhMiIsImNsaWVudEFkZHJlc3MiOiIxMzguMC42NC42NCIsImNsaWVudF9pZCI6InNoLTliZTMwMjA2LTQxYTMtNDRjOS04M2I4LWI0ZWVhNGRkZjI3MyJ9.J7CgYFTH6eCit4kgcOzNJV8fligikjzLl0pggFfePS9ftkQtEYUnr8We1OVAD_oP2fwMj0sefKWSd1WDgu4GfuhrUbUOM8DXakjKZQC2CqMsfRVOoeYfWOLCOhn9sA8YGiuqhsrYdKnTxL9Gt0Dc7SfhGww_Yc7hwX_7gd15T_cE51-3oWzlYfjiCeZW_7eAOnNuQ98CqO41Xe6GlhecPnMPdqX2jH1V8j-YBv6ukNT0VHCPjKYmajwZCCTa8xJ8ux687q6azpODUVC0C2pTw-yGoZS837EtkuX_Bp0W7sOW-XxW8I6GfpAXBRrpH-5cF7GCuy5H-EiDyCgYxfk5HQ'
    }

    private async refreshToken(): Promise<void> {

        const client_id = this.config.get('CP_CLIENT_ID') as string
        const client_secret = this.config.get('CP_CLIENT_SECRET') as string

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }

        const body = new URLSearchParams({
            client_id,
            client_secret,
            grant_type: "client_credentials"
        })
        const resposnse = await axios.post(<string>this.config.get('CP_TOKEN_URL'), body.toString(), config)

        this.token = resposnse.data.access_token
        this.expiration = Date.now() + resposnse.data.expires_in * 1000

        console.log(this.token)
        console.log(this.expiration)
    }

    getToken(): string {
        if (!this.isTokenExpired()) {
            return this.token
        }
        this.refreshToken()
        return this.token
    }

    private isTokenExpired(): boolean {
        if (!this.expiration) return true;

        const now = Date.now();
        const oneMinute = 60 * 1000;

        return now >= this.expiration - oneMinute;
    }

}