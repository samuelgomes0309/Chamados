import { UpdateSectorRequest } from "../../@types/sector/sector";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class UpdateSectorService {
	async execute({ description, name, sector_id }: UpdateSectorRequest) {
		// Verifica se o setor existe antes de tentar atualizar
		const sector = await prismaClient.sector.findUnique({
			where: {
				id: sector_id,
			},
		});
		if (!sector) {
			throw new AppError("Sector not found", 404);
		}
		const normalizedName = name?.trim().toUpperCase();
		const normalizedDescription = description?.trim();
		// Impede atualização se os valores forem iguais aos atuais
		if (
			normalizedDescription === sector.description &&
			normalizedName === sector.name
		) {
			throw new AppError(
				"Description or name is the same as the current one",
				409
			);
		}
		const updatedSector = await prismaClient.sector.update({
			where: {
				id: sector_id,
			},
			data: {
				name: normalizedName,
				description: normalizedDescription,
			},
		});
		return updatedSector;
	}
}

export { UpdateSectorService };
