declare namespace Express {
	export interface Request {
		user_id: string;
		role: "ADMIN" | "USER";
		user_sector_id: string;
	}
}
