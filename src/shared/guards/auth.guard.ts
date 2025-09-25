import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createLocalJWKSet, jwtVerify } from "jose";
import * as set from "../../../jwtset.json";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers["authorization"]?.split(" ")[1];

    if (!token) throw new UnauthorizedException('Token não fornecido');

    try {
      const key = createLocalJWKSet(set as any);

      const { payload } = await jwtVerify(token, key, {
        issuer: `${this.config.get('SB_URL')}/auth/v1`,
      });

      (request as any).user = { userId: payload.sub };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
