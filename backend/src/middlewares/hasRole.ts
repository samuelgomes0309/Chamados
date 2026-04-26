import { Request, Response, NextFunction } from "express";

// Middleware de autorização por role.
const hasRole =
	(role: "ADMIN" | "USER") =>
	(req: Request, res: Response, next: NextFunction) => {
		const roleActive = req.role;
		// Bloqueia apenas se a rota exige ADMIN e o usuário é USER
		// Caso contrário (rota exige USER, ou usuário é ADMIN), libera o acesso
		if (role === "ADMIN" && roleActive === "USER") {
			return res.status(403).json({ message: "Not authorized" });
		}
		return next();
	};

export { hasRole };
