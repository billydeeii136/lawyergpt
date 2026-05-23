"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Spinner } from "./Spinner";

type ActionStatus = "idle" | "success";
type ButtonState = "idle" | "pending" | "success";

const REDIRECT_DELAY_MS = 900;

const buttonCopy: Record<ButtonState, ReactNode> = {
	idle: "Submit",
	pending: <Spinner size={20} color="#fff" />,
	success: "Successful!",
};

const buttonVariants = {
	idle: {
		backgroundColor: "#e7e5e4",
		color: "#292524",
		boxShadow: "4px 4px 0px 0px rgba(28,25,23,1)",
	},
	pending: {
		backgroundColor: "#57534e",
		color: "#ffffff",
		boxShadow: "2px 2px 0px 0px rgba(28,25,23,1)",
	},
	success: {
		backgroundColor: "#15803d",
		color: "#ffffff",
		boxShadow: "0px 0px 0px 0px rgba(28,25,23,1)",
	},
};

export function SubmitButton({ state }: { state: { status: string } }) {
	const { pending } = useFormStatus();
	const router = useRouter();
	const [localState, setLocalState] = useState<ActionStatus>("idle");

	useEffect(() => {
		if (state.status === "success") {
			setLocalState("success");
			const timer = setTimeout(() => {
				router.replace("/");
			}, REDIRECT_DELAY_MS);
			return () => clearTimeout(timer);
		}

		setLocalState("idle");
	}, [state.status, router]);

	const buttonState = localState === "success" ? "success" : pending ? "pending" : "idle";

	useEffect(() => {
		if (state.status === "error") {
			toast.error("An error occurred");
		}
	}, [state.status]);

	return (
		<motion.button
			type="submit"
			className="w-full rounded-md border-4 border-stone-800 bg-stone-200 px-4 py-2 font-bold text-lg text-stone-800 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			variants={buttonVariants}
			animate={buttonState}
			transition={{ type: "spring", stiffness: 360, damping: 28 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			disabled={buttonState !== "idle"}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					className="flex w-full items-center justify-center"
					transition={{ type: "spring", duration: 0.2, bounce: 0 }}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					key={buttonState}
				>
					{buttonCopy[buttonState]}
				</motion.span>
			</AnimatePresence>
		</motion.button>
	);
}
