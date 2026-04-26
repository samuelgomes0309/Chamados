import z from "zod";

const ACCEPTED_TYPES = [
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/webp",
	"video/mp4",
	"video/mpeg",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export const createTicketSchema = z.object({
	description: z.string().min(1, "A descrição é obrigatória"),
	title: z.string().min(1, "O título é obrigatório"),
	sector_id: z.string().min(1, "O setor é obrigatório"),
	category_id: z.string().min(1, "A categoria é obrigatória"),
	files: z
		.custom<FileList>()
		.optional()
		.refine(
			(files) => !files || files.length <= 5,
			"Máximo de 5 arquivos permitidos"
		)
		.refine((files) => {
			if (!files) return true;
			return Array.from(files).every((file) => file.size <= 5 * 1024 * 1024);
		}, "Cada arquivo deve ter no máximo 5MB")
		.refine((files) => {
			if (!files) return true;
			return Array.from(files).every((file) =>
				ACCEPTED_TYPES.includes(file.type)
			);
		}, "Apenas imagens, vídeos, .doc e .pdf são permitidos"),
});

export type CreateTicketData = z.infer<typeof createTicketSchema>;

export const closeTicketSchema = z.object({
	resolution: z
		.string()
		.min(10, "A resolução deve ter no mínimo 10 caracteres"),
});

export type CloseTicketData = z.infer<typeof closeTicketSchema>;
