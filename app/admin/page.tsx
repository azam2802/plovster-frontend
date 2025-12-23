"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Lock, User, Eye, EyeOff } from "lucide-react";
import Background from "@/components/ui/Background";

export default function AdminLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit } = useForm();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/admin/dashboard");
        }
    }, [router]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await api.post("/auth/login", data);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userRole", res.data.user.role);
            router.push("/admin/dashboard");
        } catch (error) {
            alert("Неверный логин или пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <Background />

            <div className="relative z-10 w-full max-w-md p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden rounded-3xl border border-white/50 bg-white/30 backdrop-blur-xl shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#c3161c] via-[#e63946] to-[#fdcf9d]" />

                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c3161c] to-[#e63946] flex items-center justify-center shadow-lg shadow-red-500/30 mb-4"
                            >
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </motion.div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Вход в Admin Panel
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Только для авторизованных сотрудников
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700 font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#c3161c]" />
                                    Логин
                                </Label>
                                <Input
                                    id="username"
                                    {...register("username")}
                                    required
                                    className="h-11 bg-white/50 border-transparent focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 transition-all rounded-xl"
                                    placeholder="Введите логин"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-semibold flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-[#c3161c]" />
                                    Пароль
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        {...register("password")}
                                        required
                                        className="h-11 bg-white/50 border-transparent focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 transition-all rounded-xl pr-10"
                                        placeholder="Введите пароль"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#c3161c] via-[#e63946] to-[#c3161c] hover:shadow-lg hover:shadow-red-500/30 text-white font-semibold transition-all mt-2"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Войти
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
