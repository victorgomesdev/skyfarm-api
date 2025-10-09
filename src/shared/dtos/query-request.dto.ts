import { Coords } from "@shared/types/coords";
import { Metrics } from "@shared/types/metrics";
import { IsArray, IsDateString, IsNumber, isString, IsString, IsUUID } from "class-validator";

export class QueryRequestDto {

    @IsUUID("4")
    projectId: string

    @IsString()
    name: string

    @IsString()
    coords: string

    @IsDateString()
    dateTo: string

    @IsDateString()
    dateFrom: string

    @IsNumber()
    aggregation: number

    @IsArray()
    metrics: Metrics[]

}