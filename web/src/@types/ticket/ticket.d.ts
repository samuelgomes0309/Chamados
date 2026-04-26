import type { Category } from "../category/category";
import type { Sector } from "../sector/sector";

interface Ticket {
	id: string;
	ticket_number: number;
	title: string;
	resolution: string;
	description: string;
	status: "OPEN" | "CLOSED" | "IN_PROGRESS";
	user_id: string;
	sector_id: string;
	category_id: string;
	created_at: string;
	updated_at: string;
	started_at: string | null;
	assigned_to: string | null;
	closed_at: string | null;
	ticketAttachments: TicketAttachment[];
	Sector: Sector;
	Category: Category;
	User: {
		name: string;
		email: string;
	};
	AssignedUser: {
		name: string;
		email: string;
	};
}

interface TicketAttachment {
	id: string;
	url: string;
	name: string;
	mime_type: string;
	size: number;
	public_id: string;
	ticket_id: string;
	created_at: string;
	updated_at: string;
}

export { Ticket, TicketAttachment };
