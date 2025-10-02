import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private config: ConfigService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>()
    const token = request.headers["authorization"]?.split(" ")[1]

    if (!token) throw new UnauthorizedException("Token não fornecido")

    try {

      const key = this.config.get('JWT_KEY_URL')
      const k = createRemoteJWKSet(new URL(key))

      const { payload } = await jwtVerify(token, k, {
        issuer: `${this.config.get("SB_URL")}/auth/v1`,
      })

      if ((payload.exp as number) * 1000 < Date.now()) {
        throw new UnauthorizedException("Token expirado")
      }

      request.headers = {
        ...request.headers,
        "authorization": payload.sub
      }

      return true
    } catch (err) {
      throw new UnauthorizedException("Token inválido ou expirado")
    }
  }

}
