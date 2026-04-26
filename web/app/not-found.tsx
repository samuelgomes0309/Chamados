"use client";

import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
	const router = useRouter();
	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-4 text-white">
			<h1 className="text-4xl font-bold">404</h1>
			<h1 className="text-3xl font-bold">Erro 404 - Página não encontrada</h1>
			<h2 className="text-lg">A página que você está procurando não existe.</h2>
			<Button
				type="button"
				className="w-full max-w-2xs cursor-pointer bg-red font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
				onClick={() => router.push("/dashboard")}
			>
				Voltar para a página inicial!
			</Button>
		</div>
	);
}
