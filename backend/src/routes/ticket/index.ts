import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { validateSchema } from "../../middlewares/validateSchema";
import {
	assignTicketSchema,
	closeTicketSchema,
	createTicketSchema,
	detailTicketSchema,
	listTicketSchema,
} from "../../schema/ticket";
import { TicketController } from "../../controllers/ticket/TicketController";
import multerConfig from "../../config/multer/index";
import multer from "multer";
import { loadUserSector } from "../../middlewares/loadUserSector";

const ticketRoutes = Router();

const upload = multer(multerConfig);

ticketRoutes.post(
	"/tickets",
	isAuthenticated,
	upload.array("files"),
	validateSchema(createTicketSchema),
	new TicketController().create
);

ticketRoutes.get(
	"/tickets/me",
	isAuthenticated,
	new TicketController().listByUser
);

ticketRoutes.get(
	"/tickets/:ticket_id",
	isAuthenticated,
	loadUserSector,
	validateSchema(detailTicketSchema),
	new TicketController().detail
);

ticketRoutes.get(
	"/tickets",
	isAuthenticated,
	loadUserSector,
	validateSchema(listTicketSchema),
	new TicketController().list
);

ticketRoutes.put(
	"/tickets/assign/:ticket_id",
	isAuthenticated,
	loadUserSector,
	validateSchema(assignTicketSchema),
	new TicketController().assign
);

ticketRoutes.put(
	"/tickets/close/:ticket_id",
	isAuthenticated,
	loadUserSector,
	validateSchema(closeTicketSchema),
	new TicketController().close
);

export { ticketRoutes };
