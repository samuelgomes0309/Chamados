import { CreateSectorRequest } from "../../@types/sector/sector";
import prismaClient from "../../config/prisma/client";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../errors/AppError";

class CreateSectorService {
	async execute({ name, description }: CreateSectorRequest) {
		try {
			const normalizedName = name.trim().toUpperCase();
			const normalizedDescription = description.trim();
			const sector = await prismaClient.sector.create({
				data: {
					name: normalizedName,
					description: normalizedDescription,
				},
			});
			return sector;
		} catch (error) {
			// Barrando criar 2 setores com o mesmo nome
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new AppError("Sector already exists", 409);
				}
			}
			throw error;
		}
	}
}

export { CreateSectorService };
