import z from "zod";

export const assignSectorUserSchema = z.object({
	user_id: z.string().min(1, "O usuário é obrigatório"),
	sector_id: z.string().min(1, "O setor é obrigatório"),
});

export type AssignSectorUserData = z.infer<typeof assignSectorUserSchema>;
