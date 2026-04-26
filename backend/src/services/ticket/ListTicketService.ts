import { ListTicketRequest } from "../../@types/ticket/ticket";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class ListTicketService {
	async execute({
		everySector,
		limit = 10,
		page = 1,
		role,
		sector_id,
		user_sector_id,
		status,
	}: ListTicketRequest) {
		// Se o usuario não possuir um setor cadastrado e não for ADMIN
		if (user_sector_id === undefined && role !== "ADMIN") {
			throw new AppError("User without sector", 403);
		}
		// Paginação
		if (page < 1) throw new AppError("Page must be at least 1", 400);
		if (limit < 1) throw new AppError("Limit must be at least 1", 400);
		const where: any = {};
		if (role === "ADMIN" && everySector) {
			// Listar todos os setores
		} else if (sector_id) {
			// Listar tickets de um setor específico
			where.sector_id = sector_id;
		} else if (user_sector_id) {
			// Listar tickets do setor do usuário
			where.sector_id = user_sector_id;
		}
		if (status !== undefined) {
			if (status === "CLOSED" && role !== "ADMIN") {
				throw new AppError("Unauthorized to filter by CLOSED status", 403);
			} else {
				where.status = status;
			}
		} else {
			where.status = {
				in: ["OPEN", "IN_PROGRESS"],
			};
		}
		// Pagina começa em 1 e o limite 10
		const skip = (page - 1) * limit; // Aqui é quantos registro irá pular
		const tickets = await prismaClient.ticket.findMany({
			where,
			skip,
			take: limit,
			orderBy: [{ Sector: { name: "asc" } }, { created_at: "asc" }],
			include: {
				ticketAttachments: true,
				Sector: true,
				User: true,
				AssignedUser: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});
		const total = await prismaClient.ticket.count({ where });
		return {
			data: tickets,
			meta: {
				total,
				page: page,
				limit: limit,
				totalpages: Math.ceil(total / limit),
			},
		};
	}
}

export { ListTicketService };
