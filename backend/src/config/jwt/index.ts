import jwt from "jsonwebtoken";
import { TokenPayload } from "../../@types/jwt/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;

// Gerando o token
const generateToken = (payload: TokenPayload) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

// Validando o token — retorna o payload original (sub, role, sector_id) ou null se inválido
const validateToken = (token: string): TokenPayload | null => {
	try {
		return jwt.verify(token, JWT_SECRET) as TokenPayload;
	} catch (error) {
		return null;
	}
};

export { generateToken, validateToken };
