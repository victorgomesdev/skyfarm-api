import { Injectable, OnApplicationBootstrap, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class CopernicusAuth implements OnApplicationBootstrap {

    private token!: string
    private expiration!: number

    constructor(private config: ConfigService) { }

    async onApplicationBootstrap(): Promise<void> {
        //await this.refreshToken()

        // Token para testes
        this.token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3NTkwOTEzOTEsImlhdCI6MTc1OTA5MDc5MSwianRpIjoiNGU5NjM0M2MtYjgwZi00ZTQ0LTllY2QtYWQ2OGVjZjM4NDUxIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5kYXRhc3BhY2UuY29wZXJuaWN1cy5ldS9hdXRoL3JlYWxtcy9DRFNFIiwic3ViIjoiNmJlMWVkNjYtM2VmNS00OGU2LTlkZTQtOTZiZWEyMzI1NmQzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2gtOWJlMzAyMDYtNDFhMy00NGM5LTgzYjgtYjRlZWE0ZGRmMjczIiwic2NvcGUiOiJlbWFpbCBwcm9maWxlIHVzZXItY29udGV4dCIsImNsaWVudEhvc3QiOiIxMzguMC42NC4xMDIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm9yZ2FuaXphdGlvbnMiOlsiZGVmYXVsdC02ODU3Mzk3Ny04MjZmLTQzOWItYWMwMi1lNTVlNThjZWRmYTIiXSwidXNlcl9jb250ZXh0X2lkIjoiOWNmMWMzNGYtYjI1Yy00YzRhLTljODgtY2QxM2NmNTVlMTZmIiwiY29udGV4dF9yb2xlcyI6e30sImNvbnRleHRfZ3JvdXBzIjpbIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19nZW5lcmFsLyIsIi9vcmdhbml6YXRpb25zL2RlZmF1bHQtNjg1NzM5NzctODI2Zi00MzliLWFjMDItZTU1ZTU4Y2VkZmEyLyJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtc2gtOWJlMzAyMDYtNDFhMy00NGM5LTgzYjgtYjRlZWE0ZGRmMjczIiwidXNlcl9jb250ZXh0IjoiZGVmYXVsdC02ODU3Mzk3Ny04MjZmLTQzOWItYWMwMi1lNTVlNThjZWRmYTIiLCJjbGllbnRBZGRyZXNzIjoiMTM4LjAuNjQuMTAyIiwiY2xpZW50X2lkIjoic2gtOWJlMzAyMDYtNDFhMy00NGM5LTgzYjgtYjRlZWE0ZGRmMjczIn0.glphmPP-5fBwGphjLGadyx2bCGG4Iux83TlUmIDYvfclVPCHqOwRo2ds3wANLHhWc1qApq18bW_mdolepL0X_cuVE22Uwp4AVZt-4rBPID4yPl30SxNrZWs4UeNCKnpBWHQKKLK24B81PwXdW1nODNdFHgGeirwz9_aTuszMm-2SGkfB63TIwQbfgJrWvjDRPpNMP9A_Dh6RwUWe8yAOnO2OHjuKJr3avxRaEdqiz0FZMpwt8LwkWAsVza_qhVKPblkflMqhLrs3pbXKiHX-taTikH1joq7NTfG1UeXeyraIv_YUzeqYGa8vbdRD605EQzgC12DTEgemkDEBtppkDw'
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

    async getToken(): Promise<string> {
        // if (!this.isTokenExpired()) {
        //     return this.token
        // }
        // await this.refreshToken()
        return this.token
    }

    private isTokenExpired(): boolean {
        if (!this.expiration) return true;

        const now = Date.now();
        const tenMinute = 60 * 1000 * 10;

        return now >= this.expiration - tenMinute;
    }

}