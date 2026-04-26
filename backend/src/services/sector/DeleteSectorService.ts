import { DeleteSectorRequest } from "../../@types/sector/sector";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class DeleteSectorService {
	async execute({ sector_id }: DeleteSectorRequest) {
		// Verifica se o setor existe antes de tentar deletar
		const sectorAlreadyExists = await prismaClient.sector.findUnique({
			where: {
				id: sector_id,
			},
		});
		if (!sectorAlreadyExists) {
			throw new AppError("Sector not found", 404);
		}
		// Impede a deleção se houver chamados vinculados ao setor seja ele com status aberto, em progresso ou fechado
		const hasTickets = await prismaClient.ticket.findFirst({
			where: {
				sector_id,
			},
		});
		if (hasTickets) {
			throw new AppError("Cannot delete sector with tickets", 409);
		}
		// Deleta o setor
		await prismaClient.sector.delete({
			where: {
				id: sector_id,
			},
		});
		return { message: "Sector deleted successfully" };
	}
}

export { DeleteSectorService };
