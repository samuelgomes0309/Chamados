import { Request, Response } from "express";
import { CreateTicketService } from "../../services/ticket/CreateTicketService";
import { AssignedTicketService } from "../../services/ticket/AssignedTicketService";
import { CloseTicketService } from "../../services/ticket/CloseTicketService";
import { DetailTicketService } from "../../services/ticket/DetailTicketService";
import { ListTicketService } from "../../services/ticket/ListTicketService";
import { ListTicketByUserService } from "../../services/ticket/ListTicketByUserService";

class TicketController {
	// Criar um chamado
	async create(req: Request, res: Response) {
		const { description, title, sector_id, category_id } = req.body;
		const user_id = req.user_id;
		const files = req.files;
		const createTicketService = new CreateTicketService();
		const ticket = await createTicketService.execute({
			description,
			title,
			sector_id,
			category_id,
			user_id,
			files: files as Express.Multer.File[] | undefined,
		});
		return res.status(201).json(ticket);
	}
	// Atender um chamado
	async assign(req: Request, res: Response) {
		const { ticket_id } = req.params as { ticket_id: string };
		const user_id = req.user_id;
		const user_sector_id = req.user_sector_id;
		const assignedTicketService = new AssignedTicketService();
		const ticket = await assignedTicketService.execute({
			ticket_id,
			user_id,
			user_sector_id,
		});
		return res.status(200).json(ticket);
	}
	// Encerrar um chamado
	async close(req: Request, res: Response) {
		const { ticket_id } = req.params as { ticket_id: string };
		const { resolution } = req.body;
		const user_id = req.user_id;
		const user_sector_id = req.user_sector_id;
		const closeTicketService = new CloseTicketService();
		const ticket = await closeTicketService.execute({
			ticket_id,
			user_id,
			user_sector_id,
			resolution,
		});
		return res.status(200).json(ticket);
	}
	// Detalhar um chamado
	async detail(req: Request, res: Response) {
		const { ticket_id } = req.params as { ticket_id: string };
		const user_id = req.user_id;
		const user_sector_id = req.user_sector_id;
		const detailTicketService = new DetailTicketService();
		const ticket = await detailTicketService.execute({
			ticket_id,
			user_sector_id,
			user_id,
		});
		return res.status(200).json(ticket);
	}
	// Detalhar uma lista de chamados (ADMIN pode listar todos) (USER pode listar apenas os do seu setor, e possui uma rota que lista apenas os seus chamados)
	async list(req: Request, res: Response) {
		const { page, limit, everySector, sector_id, status } = req.query as {
			page?: string;
			limit?: string;
			everySector?: string;
			sector_id?: string;
			status?: string;
		};
		const role = req.role;
		const user_sector_id = req.user_sector_id;
		const listTicketService = new ListTicketService();
		const tickets = await listTicketService.execute({
			user_sector_id,
			page: parseInt(page || "1"),
			limit: parseInt(limit || "10"),
			role,
			everySector: everySector === "true",
			sector_id,
			status: status as "OPEN" | "CLOSED" | "IN_PROGRESS",
		});
		return res.status(200).json(tickets);
	}
	//  Listando chamados por um usuario
	async listByUser(req: Request, res: Response) {
		const user_id = req.user_id;
		const listTicketByUserService = new ListTicketByUserService();
		const tickets = await listTicketByUserService.execute(user_id);
		return res.status(200).json(tickets);
	}
}

export { TicketController };
