interface CreateUserRequest {
	name: string;
	email: string;
	password: string;
}

interface AuthUserRequest {
	email: string;
	password: string;
}

interface AssignedSectorUserRequest {
	user_id: string;
	sector_id: string;
}

interface UpdateUserRoleRequest {
	user_id: string;
	role: "USER" | "ADMIN";
}

export {
	CreateUserRequest,
	AuthUserRequest,
	AssignedSectorUserRequest,
	UpdateUserRoleRequest,
};
