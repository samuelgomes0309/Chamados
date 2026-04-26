import { AssignedSectorUserRequest } from "../../@types/user/user";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class AssignedSectorUserService {
	async execute({ user_id, sector_id }: AssignedSectorUserRequest) {
		const sector = await prismaClient.sector.findUnique({
			where: { id: sector_id, status: "ACTIVE" },
		});
		if (!sector) {
			throw new AppError("Sector not found or inactive", 404);
		}
		const user = await prismaClient.user.update({
			where: { id: user_id },
			data: { sector_id },
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

export { AssignedSectorUserService };
