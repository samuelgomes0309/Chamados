"use client";

import { LoginComponentProps } from "@/src/@types/login/login";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { SigninData, signinSchema } from "@/src/schemas/login";
import { Field, FieldError, FieldLabel } from "../../ui/field";
import { loginAction } from "@/src/actions/user";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function SignIn({ onSwitch }: LoginComponentProps) {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const {
		handleSubmit,
		control,
		reset,
		formState: { isSubmitting },
	} = useForm<SigninData>({
		resolver: zodResolver(signinSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	async function onsubmit(data: SigninData) {
		const response = await loginAction(data);
		if (response.success) {
			toast.success(`Usuário logado com sucesso!`, {
				style: {
					background: "var(--success)",
					border: "none",
					color: "white",
				},
			});
			redirect("/dashboard");
		} else {
			reset(data);
			toast.error(`Erro ao logar usuário `, {
				style: {
					background: "var(--destructive)",
					border: "none",
					color: "white",
				},
			});
		}
	}
	return (
		<div className="flex min-h-dvh min-w-dvw items-center justify-center p-4">
			<Card className="w-full max-w-md rounded-md border border-snow/15 bg-surface-alt text-white">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-extrabold text-teal italic md:text-2xl">
						Nexus
					</CardTitle>
					<CardDescription className="text-md text-center md:text-lg">
						Onde cada problema encontra sua solução!
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onsubmit)} className="space-y-3">
						<Controller
							name="email"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel className={"text-white"} htmlFor={field.name}>
										Email
									</FieldLabel>
									<Input
										id={field.name}
										placeholder="ex: exemplo@dominio.com"
										inputMode="email"
										className={`border-snow/15 bg-steel text-white placeholder:text-white/50 focus-visible:ring-0 ${fieldState.error ? "border-destructive" : ""} focus-visible:border-blue-300/50`}
										{...field}
										autoComplete="off"
									/>
									{fieldState.error && (
										<FieldError>{fieldState.error.message}</FieldError>
									)}
								</Field>
							)}
						/>
						<Controller
							name="password"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} className={"text-white"}>
										Senha
									</FieldLabel>
									<div className="relative flex w-full">
										<Input
											id={field.name}
											placeholder="******"
											type={passwordVisible ? "text" : "password"}
											className={`rounded-tr-none rounded-br-none border-snow/15 bg-steel text-white placeholder:text-white/50 focus-visible:ring-0 ${fieldState.error ? "border-destructive" : ""} focus-visible:border-blue-300/50`}
											{...field}
											autoComplete="off"
											maxLength={20}
										/>
										<Button
											type="button"
											onClick={() => setPasswordVisible(!passwordVisible)}
											className="rounded-tl-none rounded-bl-none border border-snow/15 bg-steel focus-visible:ring-0"
										>
											{passwordVisible ? <Eye /> : <EyeOff />}
										</Button>
									</div>
									{fieldState.error && (
										<FieldError>{fieldState.error.message}</FieldError>
									)}
								</Field>
							)}
						/>
						<Button
							type="submit"
							className="mt-4 w-full cursor-pointer bg-red font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<div className="size-4 animate-spin rounded-full border border-t-black"></div>
							) : (
								"Entrar"
							)}
						</Button>
					</form>
					<div className="flex w-full">
						<Button
							type="button"
							className="mx-auto my-auto mt-1 cursor-pointer bg-transparent text-ring transition-all duration-700 hover:text-white/80"
							onClick={onSwitch}
							disabled={isSubmitting}
						>
							Não possui uma conta? Cadastre-se
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
