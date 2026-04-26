import { AuthUserRequest } from "../../@types/user/user";
import { generateToken } from "../../config/jwt";
import prismaClient from "../../config/prisma/client";
import bcrypt from "bcryptjs";
import { AppError } from "../../errors/AppError";

class AuthUserService {
	async execute({ email, password }: AuthUserRequest) {
		const user = await prismaClient.user.findUnique({
			where: { email },
		});
		if (!user) {
			throw new AppError("User not found", 404);
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			throw new AppError("Invalid credentials", 401);
		}
		const { id, name, role, sector_id } = user;
		const token = generateToken({
			sub: id, // user_id
			role: role, // user_role
			sector_id: sector_id, // sector_id no momento do login
		});
		return {
			id,
			name,
			email: user.email,
			role,
			token,
		};
	}
}

export { AuthUserService };
