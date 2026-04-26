import z from "zod";

const createUserSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		email: z.email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters long"),
	}),
});

const loginUserSchema = z.object({
	body: z.object({
		email: z.email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters long"),
	}),
});

const assignSectorUserSchema = z.object({
	body: z.object({
		user_id: z.string().min(1, "User ID is required"),
		sector_id: z.string().min(1, "Sector ID is required"),
	}),
});

const updateUserRoleSchema = z.object({
	params: z.object({
		user_id: z.string().min(1, "User ID is required"),
		role: z.enum(["USER", "ADMIN"]),
	}),
});

export {
	createUserSchema,
	loginUserSchema,
	assignSectorUserSchema,
	updateUserRoleSchema,
};
