import jwt from "jsonwebtoken";

export function verifyToken(token: string): string {
    const secret = process.env.JWT_SECRET;


    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & {
        id: string;
    };

    if (typeof decoded.id !== "string" || !decoded.id) {
        throw new Error("Invalid token payload");
    }

    return decoded.id;


}
