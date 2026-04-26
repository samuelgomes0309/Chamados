import z from "zod";

export const createCategorySchema = z.object({
	name: z.string().min(1, "O nome é obrigatório"),
	priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
	sector_id: z.string().min(1, "O setor é obrigatório"),
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
