import { CloseTicketRequest } from "../../@types/ticket/ticket";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class CloseTicketService {
	async execute({
		user_id,
		ticket_id,
		user_sector_id,
		resolution,
	}: CloseTicketRequest) {
		const ticket = await prismaClient.ticket.findUnique({
			where: { id: ticket_id },
		});
		if (!ticket) {
			throw new AppError("Ticket not found", 404);
		}
		if (ticket.status === "CLOSED") {
			throw new AppError("Ticket is already closed", 409);
		}
		if (ticket.sector_id !== user_sector_id) {
			throw new AppError(
				"User does not belong to the same sector as the ticket.",
				403
			);
		}
		if (ticket.assigned_to !== user_id) {
			throw new AppError("You are not authorized to close this ticket", 403);
		}
		const updatedticket = await prismaClient.ticket.update({
			where: {
				id: ticket_id,
			},
			data: {
				status: "CLOSED",
				closed_at: new Date(),
				resolution: resolution,
			},
		});
		return updatedticket;
	}
}

export { CloseTicketService };
