"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden -z-10 bg-[#f8fafc]">
            {/* Base gradient mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),_rgba(255,255,255,0))]" />

            {/* Moving Orbs */}
            {/* Blue Orb */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-300/30 rounded-full blur-[100px]"
            />

            {/* Orange/Red Orb */}
            <motion.div
                animate={{
                    x: [0, -70, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-300/30 rounded-full blur-[120px]"
            />

            {/* Purple/Accent Orb */}
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, 50, 50, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-purple-300/20 rounded-full blur-[90px]"
            />
        </div>
    );
}
