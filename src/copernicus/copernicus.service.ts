import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from '@nestjs/axios'
import { QueryRequestDto } from "@shared/dtos/query-request.dto";
import { CopernicusAuth } from "@copernicus/copernicus.auth.provider";
import { ndviBuilder } from "@shared/utils/ndvi-builder";
import { SupabaseClient } from "@supabase/supabase-js";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { Metrics } from "@shared/types/metrics";

@Injectable()
export class CopernicusService {

    private results: { NVDI: { image: string, stats: any } }

    constructor(
        private auth: CopernicusAuth,
        private http: HttpService,
        @Inject('SUPABASE_PROVIDER')
        private sp: SupabaseClient
    ) { }

    async processQuery(body: QueryRequestDto) {

        let token: string
        token = this.auth.getToken()

        this.http.axiosRef.defaults.headers.common["Authorization"] = `Bearer ${token}`

        if (body.metrics.includes('NDVI')) {
            const { image, stats } = ndviBuilder(body.coords, body.from, body.to)
            await this.getSatelliteData(image, stats, 'NDVI', body.projectId)
        }
    }

    private async getSatelliteData(imagePayload: any, statsPayload: any, metric: Metrics, projectId: string): Promise<any> {

        const response = await Promise.all([
            firstValueFrom(this.http.post<ArrayBuffer>("/process", imagePayload, { responseType: "arraybuffer" }).pipe(
                catchError((err: AxiosError) => {
                    throw new InternalServerErrorException()
                })
            )),
            firstValueFrom(this.http.post<any>("/statistcs", statsPayload).pipe(
                catchError((err: AxiosError) => {
                    throw new InternalServerErrorException()
                })
            ))
        ])

        const imageBuffer = Buffer.from(response[0].data)

        const { data, error } = await this.sp
            .storage
            .from('projects/' + projectId)
            .upload(metric + '', imageBuffer, { contentType: 'image/png', upsert: true })

        if (error) {
            throw new InternalServerErrorException()
        }

    }
}