import z from "zod";

export const createSectorSchema = z.object({
	name: z.string().min(1, "O nome do setor é obrigatório"),
	description: z.string().min(1, "A descrição do setor é obrigatória"),
});

export type CreateSectorData = z.infer<typeof createSectorSchema>;
