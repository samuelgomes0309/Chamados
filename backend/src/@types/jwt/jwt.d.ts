export interface TokenPayload {
	sub: string; // user_id
	role: "ADMIN" | "USER";
	sector_id: string | null; // sector_id do usuário no momento do login
}
