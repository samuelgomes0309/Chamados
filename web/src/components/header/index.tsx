"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
	title: string;
	description?: string;
	buttonText?: string;
	onButtonClick?: () => void;
	children?: React.ReactNode;
}

export function Header({
	title,
	description,
	buttonText,
	onButtonClick,
	children,
}: HeaderProps) {
	return (
		<header>
			<div className="flex w-full items-center justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
					{description && <p className="text-ring">{description}</p>}
				</div>
				{buttonText && (
					<Button
						className="w-full max-w-48 cursor-pointer bg-teal-500 font-bold transition-colors duration-700 hover:bg-teal-600 focus-visible:ring-0"
						onClick={onButtonClick}
					>
						<Plus />
						<span>{buttonText}</span>
					</Button>
				)}
			</div>
			{children}
		</header>
	);
}
