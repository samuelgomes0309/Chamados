import z from "zod";

export const signinSchema = z.object({
	email: z.email("Endereço de e-mail inválido"),
	password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const signupSchema = z.object({
	name: z.string().min(1, "O nome é obrigatório"),
	email: z.email("Endereço de e-mail inválido"),
	password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type SigninData = z.infer<typeof signinSchema>;

export type SignupData = z.infer<typeof signupSchema>;
