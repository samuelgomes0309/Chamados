interface UserApiResponse {
	id: string;
	name: string;
	email: string;
	sector_id: string;
	role: "ADMIN" | "USER";
	token: string;
}

interface User {
	id: string;
	name: string;
	email: string;
	sector_id: string;
	role: "ADMIN" | "USER";
}

export { UserApiResponse, User };
