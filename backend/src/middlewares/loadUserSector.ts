import { Response, Request, NextFunction } from "express";
import { AppError } from "../errors/AppError";

// sector_id já foi injetado em req.user_sector_id pelo isAuthenticated
// (lido diretamente do payload JWT — sem query ao banco)
const loadUserSector = (req: Request, _res: Response, next: NextFunction) => {
	if (!req.user_sector_id) {
		return next(new AppError("User does not have a sector assigned", 403));
	}
	next();
};

export { loadUserSector };
