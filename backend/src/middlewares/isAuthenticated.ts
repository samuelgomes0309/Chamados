import { Request, Response, NextFunction } from "express";
import { validateToken } from "../config/jwt";

// FLuxo
// Requisição chega
//
// Tem header Authorization? → NÃO → 401 "Token not provided"
//         SIM
// Extrai o token do "Bearer <token>"
//
// validateToken(token) → null? → lança erro → 401 "Invalid token"
//          payload válido
// Popula req.user_id e req.role
//
// next() -> segue para a rota protegida

export function isAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction
) {
	// Lê o header "Authorization" da requisição
	const authorization = req.headers.authorization;
	// Se o header não foi enviado, rejeita imediatamente
	if (!authorization) {
		return res.status(401).json({ message: "Token not provided" });
	}
	// Divide a string "Bearer <token>" pelo espaço
	const [, token] = authorization.split(" ");
	try {
		// Valida o token — retorna { sub, role } ou null se inválido
		const payload = validateToken(token!);
		// Se validateToken retornou null (token inválido/expirado), lança erro
		// que cai direto no catch abaixo
		if (!payload) {
			throw new Error("Invalid token");
		}
		// Injeta os dados do usuário autenticado no objeto req
		// para que as próximas rotas/controllers possam acessá-los
		req.user_id = payload.sub;
		req.role = payload.role;
		if (payload.sector_id) {
			req.user_sector_id = payload.sector_id;
		}
		// Chama o próximo middleware ou a rota de destino
		return next();
	} catch (error) {
		// Qualquer erro (token inválido, expirado, malformado) retorna 401
		return res.status(401).json({ message: "Invalid token" });
	}
}
