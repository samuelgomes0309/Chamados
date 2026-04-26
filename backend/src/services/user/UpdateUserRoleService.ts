import { UpdateUserRoleRequest } from "../../@types/user/user";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class UpdateUserRoleService {
	async execute({ user_id, role }: UpdateUserRoleRequest) {
		const userExists = await prismaClient.user.findUnique({
			where: { id: user_id },
		});
		if (!userExists) {
			throw new AppError("User not found", 404);
		}
		if (userExists.role === role) {
			throw new AppError(`User already has the ${role} role`);
		}
		const user = await prismaClient.user.update({
			where: { id: user_id },
			data: { role },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				sector_id: true,
			},
		});
		return user;
	}
}

export { UpdateUserRoleService };
