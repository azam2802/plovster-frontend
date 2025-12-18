"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, User, Building2, MessageSquare, Lightbulb, Phone, Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

// Schema
const complaintSchema = z.object({
    fullName: z.string().min(2, "ФИО должно быть длиннее 2 символов").max(100),
    branch: z.string({ message: "Выберите филиал" }).min(1, "Выберите филиал"),
    problem: z.string().min(10, "Опишите проблему подробнее (минимум 10 символов)").max(1000),
    solution: z.string().max(1000).optional(),
    contact: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface Branch {
    id: string;
    name: string;
}

const stepInfo = [
    { title: "Личные данные", icon: User, description: "Представьтесь, пожалуйста" },
    { title: "Описание проблемы", icon: MessageSquare, description: "Расскажите, что случилось" },
    { title: "Предложение", icon: Lightbulb, description: "Как можно улучшить?" },
    { title: "Контакты", icon: Phone, description: "Как с вами связаться?" },
];

export default function ComplaintWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(true);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    // Fetch branches from API
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get("/branches");
                setBranches(res.data.data);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
                // Fallback to empty array
                setBranches([]);
            } finally {
                setBranchesLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        trigger,
        reset,
    } = useForm<ComplaintFormData>({
        resolver: zodResolver(complaintSchema),
        mode: "onChange",
    });

    const selectedBranch = watch("branch");
    const currentRating = watch("rating") || 0;

    const nextStep = async () => {
        let fieldsToValidate: (keyof ComplaintFormData)[] = [];
        if (step === 1) fieldsToValidate = ["fullName", "branch"];
        if (step === 2) fieldsToValidate = ["problem"];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) setStep((s) => s + 1);
    };

    const prevStep = () => setStep((s) => s - 1);

    const onSubmit = async (data: ComplaintFormData) => {
        if (!captchaToken) {
            alert("Пожалуйста, подтвердите, что вы не робот");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post("/complaints", { ...data, captchaToken });
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Ошибка при отправке. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const variants = {
        enter: { x: 30, opacity: 0, scale: 0.98 },
        center: { x: 0, opacity: 1, scale: 1 },
        exit: { x: -30, opacity: 0, scale: 0.98 },
    };

    // Success Screen
    if (isSuccess) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative"
                >
                    {/* Floating particles */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#34d399" : "#60a5fa",
                                left: "50%",
                                top: "50%",
                            }}
                            initial={{ x: 0, y: 0, opacity: 1 }}
                            animate={{
                                x: Math.cos((i * 30 * Math.PI) / 180) * 120,
                                y: Math.sin((i * 30 * Math.PI) / 180) * 120,
                                opacity: 0,
                                scale: [1, 1.5, 0],
                            }}
                            transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                        />
                    ))}

                    <div className="relative z-10 p-12 rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 shadow-2xl text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-500/30 mb-6"
                        >
                            <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3"
                        >
                            Спасибо за отзыв!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-500 text-lg"
                        >
                            Мы рассмотрим его в ближайшее время
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Ваше мнение важно для нас</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="mt-8"
                        >
                            <Button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setStep(1);
                                    reset();
                                    setCaptchaToken(null);
                                }}
                                className="px-8 rounded-full bg-gradient-to-r from-[#c3161c] to-[#e63946] hover:shadow-lg hover:shadow-red-500/30 text-white font-semibold transition-all h-12"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Вернуться в начало
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1000px] mx-auto p-0 md:p-4">
            {/* Step Indicators */}
            <div className="mb-4 px-4 py-4 md:px-8 md:py-6">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line Background */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-12" />
                    {/* Progress Line Fill */}
                    <motion.div
                        className="absolute top-6 left-0 h-1 bg-gradient-to-r from-[#c3161c] to-[#fdcf9d] rounded-full mx-12"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step - 1) / 3) * 100}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ maxWidth: "calc(100% - 6rem)" }}
                    />

                    {stepInfo.map((info, index) => {
                        const Icon = info.icon;
                        const isActive = step === index + 1;
                        const isCompleted = step > index + 1;

                        return (
                            <div key={index} className="relative z-10 flex flex-col items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                        boxShadow: isActive
                                            ? "0 0 0 4px rgba(195, 22, 28, 0.2), 0 8px 24px rgba(195, 22, 28, 0.3)"
                                            : isCompleted
                                                ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                                                : "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted
                                        ? "bg-gradient-to-br from-emerald-400 to-green-500"
                                        : isActive
                                            ? "bg-gradient-to-br from-[#c3161c] to-[#e63946]"
                                            : "bg-white border-2 border-gray-200"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </motion.div>
                                    ) : (
                                        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                                    )}
                                </motion.div>

                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                {/* Decorative gradient orbs */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="relative px-4 pb-4 md:px-8 md:pb-6 border-b border-gray-100/50">
                    <div className="flex flex-col text-center items-center gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{stepInfo[step - 1].title}</h2>
                            <p className="text-sm text-gray-500">{stepInfo[step - 1].description}</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="relative px-4 py-4 md:px-8 md:py-6 min-h-[280px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#c3161c]" />
                                            Ваше ФИО
                                            <span className="text-violet-500">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            {...register("fullName")}
                                            placeholder="Асанов Асан Асанович"
                                            className="h-12 px-4 rounded-xl border-transparent bg-white/40 focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 transition-all shadow-sm"
                                        />
                                        {errors.fullName && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm flex items-center gap-1"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-red-500" />
                                                {errors.fullName.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-[#c3161c]" />
                                            Филиал
                                            <span className="text-violet-500">*</span>
                                        </Label>
                                        <Select onValueChange={(val) => setValue("branch", val)} defaultValue={selectedBranch}>
                                            <SelectTrigger className="h-12 px-4 rounded-xl border-transparent bg-white/40 focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 transition-all shadow-sm">
                                                <SelectValue placeholder="Выберите филиал" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-200 shadow-xl bg-white/10 backdrop-blur-md">
                                                {branchesLoading ? (
                                                    <SelectItem value="loading" disabled className="rounded-lg">
                                                        Загрузка...
                                                    </SelectItem>
                                                ) : branches.length === 0 ? (
                                                    <SelectItem value="empty" disabled className="rounded-lg">
                                                        Нет филиалов
                                                    </SelectItem>
                                                ) : (
                                                    branches.map((b) => (
                                                        <SelectItem key={b.id} value={b.name} className="rounded-lg">
                                                            {b.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.branch && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm flex items-center gap-1"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-red-500" />
                                                {errors.branch.message}
                                            </motion.p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="problem" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-[#c3161c]" />
                                            Опишите проблему
                                            <span className="text-violet-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="problem"
                                            {...register("problem")}
                                            placeholder="Что случилось? Опишите подробно..."
                                            className="min-h-[160px] px-4 py-3 rounded-xl border-transparent bg-white/40 focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 resize-none transition-all shadow-sm"
                                        />
                                        {errors.problem && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm flex items-center gap-1"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-red-500" />
                                                {errors.problem.message}
                                            </motion.p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="solution" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-[#fdcf9d]" />
                                            Ваше предложение
                                            <span className="text-gray-400 font-normal">(опционально)</span>
                                        </Label>
                                        <Textarea
                                            id="solution"
                                            {...register("solution")}
                                            placeholder="Как можно улучшить ситуацию? Поделитесь идеями..."
                                            className="min-h-[160px] px-4 py-3 rounded-xl border-transparent bg-white/40 focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 resize-none transition-all shadow-sm"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="contact" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#c3161c]" />
                                            Контакты
                                            <span className="text-gray-400 font-normal">(email или телефон)</span>
                                        </Label>
                                        <Input
                                            id="contact"
                                            {...register("contact")}
                                            placeholder="+996 (555) 12-34-56 или email@example.com"
                                            className="h-12 px-4 rounded-xl border-transparent bg-white/40 focus:bg-white focus:border-[#c3161c] focus:ring-4 focus:ring-[#c3161c]/10 transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-amber-500" />
                                            Оцените работу
                                        </Label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isActive = (hoveredStar || currentRating) >= star;
                                                return (
                                                    <motion.button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setValue("rating", star)}
                                                        onMouseEnter={() => setHoveredStar(star)}
                                                        onMouseLeave={() => setHoveredStar(0)}
                                                        whileHover={{ scale: 1.15 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="relative p-2 rounded-xl transition-colors"
                                                        style={{
                                                            background: isActive ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "transparent",
                                                        }}
                                                    >
                                                        <Star
                                                            className={`w-8 h-8 transition-all ${isActive
                                                                ? "text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <ReCAPTCHA
                                            sitekey="6LfVwCosAAAAAASdHSh7gtx83nM70YyClIJ9OTJ5"
                                            onChange={setCaptchaToken}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-6 pt-4 md:mt-8 md:pt-6 border-t border-gray-100/80">
                            <motion.div
                                initial={false}
                                animate={{ opacity: step > 1 ? 1 : 0, x: step > 1 ? 0 : -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        className="h-11 px-5 rounded-full border-2 border-gray-200 bg-white/50 hover:bg-gray-50 hover:border-gray-300 text-gray-600 font-medium gap-2 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Назад
                                    </Button>
                                )}
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {step < 4 ? (
                                    <Button
                                        key="next-button"
                                        type="button"
                                        onClick={nextStep}
                                        className="h-11 px-7 rounded-full bg-gradient-to-r from-[#c3161c] via-[#e63946] to-[#c3161c] hover:shadow-lg hover:shadow-red-500/30 text-white font-semibold gap-2 transition-all"
                                    >
                                        Продолжить
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        key="submit-button"
                                        type="submit"
                                        disabled={isSubmitting || !captchaToken}
                                        className="h-11 px-7 rounded-full bg-gradient-to-r from-[#c3161c] via-[#e63946] to-[#c3161c] hover:shadow-lg hover:shadow-red-500/30 text-white font-semibold gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Отправка...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Отправить
                                            </>
                                        )}
                                    </Button>
                                )}
                            </motion.div>
                        </div>
                    </form>
                </div>
            </motion.div >
        </div >
    );
}
