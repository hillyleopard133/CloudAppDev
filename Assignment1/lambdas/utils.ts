import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerEvent,
  PolicyDocument,
  APIGatewayProxyEvent,
  StatementEffect,
} from "aws-lambda";

import axios from "axios"
// const jwkToPem = require("jwk-to-pem");
// const jwt = require("jsonwebtoken");
import jwt, { JwtPayload } from 'jsonwebtoken'
import jwkToPem, { JWK }  from "jwk-to-pem";

export type CookieMap = { [key: string]: string } | undefined;
export type JwtToken = { sub: string; email: string } | null;
export type Jwk = {
  keys: {
    alg: string;
    e: string;
    kid: string;
    kty: string;
    n: string;
    use: string;
  }[];
};

type CognitoJwks = { keys: JWK[] }; 

export const parseCookies = (
  event: APIGatewayRequestAuthorizerEvent | APIGatewayProxyEvent
) => {
  if (!event.headers || !event.headers.Cookie) {
    return undefined;
  }

  const cookiesStr = event.headers.Cookie;
  const cookiesArr = cookiesStr.split(";");

  const cookieMap: CookieMap = {};

  for (let cookie of cookiesArr) {
    const cookieSplit = cookie.trim().split("=");
    cookieMap[cookieSplit[0]] = cookieSplit[1];
  }

  return cookieMap;
};

export const verifyToken = async (
  token: string,
  userPoolId: string | undefined,
  region: string
): Promise<JwtToken> => {
  try {
    const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    
    // Lab code was giving me errors so i asked chatgpt to help me fix it
    
type CognitoJwks = { keys: Array<JWK & { kid?: string }> };

const { data } = await axios.get<CognitoJwks>(url);

const decodedHeader = jwt.decode(token, { complete: true }) as
  | { header?: { kid?: string } }
  | null;

const kid = decodedHeader?.header?.kid;
if (!kid) return null;

const jwk = data.keys.find(k => k.kid === kid && k.kty === "RSA");
if (!jwk) return null;

const pem = jwkToPem(jwk as JWK); // cast back to JWK for the helper

    const decoded = jwt.verify(token, pem, { algorithms: ["RS256"] }) as JwtPayload;
    return decoded ? { sub: decoded.sub!, email: decoded.email as string } : null;

    //return jwt.verify(token, pem, { algorithms: ["RS256"] });
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const createPolicy = (
  event: APIGatewayAuthorizerEvent,
  effect: StatementEffect
): PolicyDocument => {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: effect,
        Action: "execute-api:Invoke",
        Resource: [event.methodArn],
      },
    ],
  };
};
