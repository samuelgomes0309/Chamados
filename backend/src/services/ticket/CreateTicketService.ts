import { Readable } from "node:stream";
import { CreateTicketRequest } from "../../@types/ticket/ticket";
import cloudinary from "../../config/cloudinary";
import prismaClient from "../../config/prisma/client";
import { DetailCategoryService } from "../category/DetailCategoryService";
import { DetailUserService } from "../user/DetailUserService";
import { AppError } from "../../errors/AppError";

// Mapeia a extensão do arquivo para o MIME type correspondente.
// Retorna "application/octet-stream" como fallback para formatos desconhecidos.
const getMimeType = (format: string) => {
	const map: Record<string, string> = {
		pdf: "application/pdf",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		webp: "image/webp",
	};
	return map[format] || "application/octet-stream";
};

//  Falta criar um jeito de quando falhar algum upload de arquivo deletar primeiro antes de apagar o chamado
class CreateTicketService {
	async execute({
		description,
		title,
		sector_id,
		category_id,
		user_id,
		files,
	}: CreateTicketRequest) {
		// Valida se o usuário existe e está ativo antes de prosseguir
		await new DetailUserService().execute(user_id);
		// Valida se a categoria existe e está ativa antes de prosseguir
		await new DetailCategoryService().execute({
			category_id: category_id,
		});
		// Cria o ticket no banco de dados com os dados fornecidos
		const ticket = await prismaClient.ticket.create({
			data: {
				description,
				title,
				sector_id,
				category_id,
				user_id,
			},
		});
		// Processa os anexos apenas se arquivos foram enviados na requisição
		if (files && files.length > 0) {
			try {
				// Faz o upload de um arquivo para o Cloudinary usando stream,
				// evitando a escrita em disco. O public_id é gerado com o ID do
				// ticket + nome original + timestamp para evitar nomes duplicados
				const uploadFromBuffer = (file: Express.Multer.File) => {
					return new Promise<any>((resolve, reject) => {
						const stream = cloudinary.uploader.upload_stream(
							{
								folder: "uploads-tickets",
								public_id: `${ticket.id}_${file.originalname.split(".")[0]}-${Date.now()}`,
							},
							(error, result) => {
								if (error) return reject(error);
								resolve(result);
							}
						);
						Readable.from(file.buffer).pipe(stream);
					});
				};
				// Realiza os uploads em paralelo para todos os arquivos recebidos
				const uploadFiles = await Promise.all(
					files.map((file: Express.Multer.File) => uploadFromBuffer(file))
				);
				if (!uploadFiles || uploadFiles.length === 0) {
					throw new Error("Upload failed");
				}
				// Registra os anexos no banco de dados vinculados ao ticket criado
				await prismaClient.ticketAttachment.createMany({
					data: uploadFiles.map((file: any) => ({
						url: file.secure_url,
						name: file.display_name,
						size: file.bytes,
						mime_type: getMimeType(file.format),
						ticket_id: ticket.id,
						public_id: file.public_id,
					})),
				});
			} catch (error) {
				// Em caso de falha no upload, o ticket é removido do banco para
				// manter a consistência dos dados (rollback manual)
				await prismaClient.ticket.delete({
					where: { id: ticket.id },
				});
				throw new AppError(
					"Failed to upload files and ticket was deleted",
					500
				);
			}
		}
		// Retorna o ticket completo após a criação
		return prismaClient.ticket.findUnique({
			where: { id: ticket.id },
			include: {
				ticketAttachments: true,
			},
		});
	}
}

export { CreateTicketService };
