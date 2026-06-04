
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config/index.js";

export interface TokenPayload {
  id: string;
  email: string;
}

export const tokenManager = {

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return {
      id: decoded["id"] as string,
      email: decoded["email"] as string,
    };
  },
};
