import { Inject, Injectable, InternalServerErrorException, Scope } from "@nestjs/common";
import { HttpService } from '@nestjs/axios'
import { CopernicusAuth } from "@copernicus/copernicus.auth.provider";
import { QueryRequestDto } from "@shared/dtos/query-request.dto";
import { Metrics } from "@shared/types/metrics";
import { ndviBuilder } from "@shared/utils/ndvi-builder";
import { createArea } from "@shared/utils/create-area.util";
import { uploadImage } from "@shared/utils/upload-image.util";
import { SupabaseClient } from "@supabase/supabase-js";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { saveMetrics } from "@shared/utils/save-metrics.util";
import { parseStatisticalResponse } from "@shared/utils/parse-stats-response";

@Injectable({ scope: Scope.REQUEST })
export class CopernicusService {

    private token!: string

    constructor(
        private auth: CopernicusAuth,
        private http: HttpService,
        @Inject('SUPABASE_PROVIDER')
        private sp: SupabaseClient
    ) { }

    async processQuery(body: any): Promise<any> {

        this.token = await this.auth.getToken()

        const { id } = await createArea(this.sp, body.name, body.project_id, body.coords, body.datefrom, body.dateto)

        if (body.metrics.includes('NDVI')) {
            const { image, stats } = ndviBuilder(body.coords, body.datefrom, body.dateto, body.aggregation)
            await this.getSatelliteData(image, stats, 'NDVI', body.project_id, id)
        }

        return { areaId: id }
    }

    private async getSatelliteData(
        imagePayload: any,
        statsPayload: any,
        metric: Metrics,
        projectId: string,
        areaId: string,
    ): Promise<void> {

        const result = await Promise.all([
            firstValueFrom(
                this.http.post('/statistics', statsPayload, {
                    headers: {
                        "Authorization": `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }).pipe(
                    catchError((err: AxiosError) => {
                        console.log(err.response)
                        throw new InternalServerErrorException('Erro ao salvar status.')
                    })
                )

            ),
            firstValueFrom(
                this.http.post('/process', imagePayload, {
                    responseType: 'arraybuffer',
                    headers: {
                        "Authorization": `Bearer ${this.token}`,
                        "Accept": 'image/png',
                        "Content-Type": 'application/json'
                    }
                }).pipe(
                    catchError((err: AxiosError) => {
                        console.log(err)
                        throw new InternalServerErrorException('Erro ao gerar imagem')
                    })
                )
            )
        ])

        const imageBuffer = Buffer.from(result[1].data)
        const parsedStats = parseStatisticalResponse(result[0].data)

        await Promise.all([
            saveMetrics(this.sp, areaId, metric, parsedStats),
            uploadImage(this.sp, projectId, areaId, metric, imageBuffer)
        ])

        return
    }

}