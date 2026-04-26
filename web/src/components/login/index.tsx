"use client";

import { useState } from "react";
import SignIn from "./signin";
import SignUp from "./signup";

export default function Login() {
	const [isLogin, setIsLogin] = useState<boolean>(true);
	return isLogin ? (
		<SignIn onSwitch={() => setIsLogin(false)} />
	) : (
		<SignUp onSwitch={() => setIsLogin(true)} />
	);
}
