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

@Injectable({ scope: Scope.REQUEST })
export class CopernicusService {

    private token!: string

    constructor(
        private auth: CopernicusAuth,
        private http: HttpService,
        @Inject('SUPABASE_PROVIDER')
        private sp: SupabaseClient
    ) { }

    async processQuery(body: QueryRequestDto): Promise<void> {

        this.token = await this.auth.getToken()

        const areaId = await createArea(this.sp, body.projectId, body.coords, body.from, body.to)

        const { error } = await this.sp.schema('skyfarm')
            .from('metrics')
            .insert({
                area_id: areaId
            })
        if (error) throw new InternalServerErrorException(error.message);

        if (body.metrics.includes('NDVI')) {
            const { image, stats } = ndviBuilder(body.coords, body.from, body.to)
            await this.getSatelliteData(image, stats, 'NDVI', body.projectId, areaId)
        }
    }

    private async getSatelliteData(imagePayload: any, statsPayload: any, metric: Metrics, projectId: string, areaId: string): Promise<void> {

        const response = await Promise.all([
            firstValueFrom(this.http.post<ArrayBuffer>("/process", imagePayload,
                {
                    responseType: "arraybuffer",
                    headers: {
                        "Authorization": `Bearer ${this.token}`
                    }
                }).pipe(
                    catchError((err: AxiosError) => {
                        throw new InternalServerErrorException()
                    })
                )),
            firstValueFrom(this.http.post<any>("/statistics", statsPayload, {
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            }).pipe(
                catchError((err: AxiosError) => {
                    throw new InternalServerErrorException()
                })
            ))
        ])

        const imageBuffer = Buffer.from(response[0].data)

        await Promise.all([
            uploadImage(this.sp, projectId, areaId, metric, imageBuffer),
            saveMetrics(this.sp, areaId, metric, response[1].data)
        ]).catch(() => {
            throw new InternalServerErrorException()
        })

        return
    }
}