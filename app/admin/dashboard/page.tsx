"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2, RefreshCw, Plus, Trash2, Building2, Users, LogOut,
    LayoutDashboard, MessageSquare, Search, Filter, ChevronDown, CheckCircle, AlertCircle, User as UserIcon,
    Eye, X, Menu, Save
} from "lucide-react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { Textarea } from "@/components/ui/textarea";

interface Complaint {
    id: string;
    fullName: string;
    branch: string;
    problem: string;
    solution?: string;
    contact?: string;
    rating?: number;
    adminComment?: string;
    createdAt: string;
    status: 'New' | 'In progress' | 'Solved';
}

interface Branch {
    id: string;
    name: string;
}

interface User {
    id: string;
    username: string;
    role: 'admin' | 'manager';
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'complaints' | 'branches' | 'users'>('complaints');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Analytics & Filters
    const [analytics, setAnalytics] = useState({ total: 0, globalAvgRating: 0 });
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<string>("date_desc");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Branch form state
    const [newBranchName, setNewBranchName] = useState("");
    const [branchSubmitting, setBranchSubmitting] = useState(false);

    // User form state
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState<'admin' | 'manager'>('manager');
    const [userSubmitting, setUserSubmitting] = useState(false);

    // Operation loading states
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [commentSaving, setCommentSaving] = useState(false);

    const fetchData = async () => {
        setFetching(true);
        try {
            const params: any = { page, limit: 15 };
            if (activeTab === 'complaints') {
                if (selectedBranch !== "all") params.branch = selectedBranch;
                if (sortOrder) params.sort = sortOrder;
            }

            const [complaintsRes, branchesRes, analyticsRes] = await Promise.all([
                api.get("/complaints", { params }),
                api.get("/branches"),
                api.get("/complaints/analytics")
            ]);

            setComplaints(complaintsRes.data.data);
            setTotalPages(complaintsRes.data.totalPages || 1);
            setBranches(branchesRes.data.data);
            if (analyticsRes.data.success) {
                setAnalytics(analyticsRes.data.data);
            }

            const role = localStorage.getItem("userRole");
            setUserRole(role);
            if (role === 'admin') {
                const usersRes = await api.get("/users");
                setUsers(usersRes.data.data);
            }
        } catch (error) {
            console.error(error);
            // router.push("/admin"); // Don't redirect on error, just log
        } finally {
            setInitialLoading(false);
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedBranch, sortOrder, page]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        router.push("/admin");
    };

    const handleAddBranch = async () => {
        if (!newBranchName.trim()) return;
        setBranchSubmitting(true);
        try {
            await api.post("/branches", { name: newBranchName.trim() });
            setNewBranchName("");
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка при добавлении филиала");
        } finally {
            setBranchSubmitting(false);
        }
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm("Удалить этот филиал?")) return;
        try {
            await api.delete(`/branches/${id}`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка при удалении филиала");
        }
    };

    const handleAddUser = async () => {
        if (!newUsername.trim() || !newPassword.trim()) return;
        setUserSubmitting(true);
        try {
            await api.post("/users", {
                username: newUsername.trim(),
                password: newPassword,
                role: newUserRole
            });
            setNewUsername("");
            setNewPassword("");
            setNewUserRole('manager');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Ошибка при добавлении пользователя");
        } finally {
            setUserSubmitting(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-[#c3161c]" />
            </div>
        );
    }

    const isAdmin = userRole === 'admin';

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            <AnimatedBackground />

            {/* Sidebar */}
            <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#c3161c] to-[#e63946] bg-clip-text text-transparent">
                        PLOVSTER
                        <span className="text-xs text-gray-400 ml-1 font-normal">ADMIN</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints'
                            ? "bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white shadow-lg shadow-red-500/20"
                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">Жалобы</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'branches'
                            ? "bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white shadow-lg shadow-red-500/20"
                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                            }`}
                    >
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">Филиалы</span>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users'
                                ? "bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white shadow-lg shadow-red-500/20"
                                : "text-gray-600 hover:bg-white hover:shadow-sm"
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Сотрудники</span>
                        </button>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Выйти</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-xl border-r border-white/50 z-50 md:hidden flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between">
                                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#c3161c] to-[#e63946] bg-clip-text text-transparent">
                                    PLOVSTER
                                    <span className="text-xs text-gray-400 ml-1 font-normal">ADMIN</span>
                                </h1>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </Button>
                            </div>

                            <nav className="flex-1 px-4 space-y-2">
                                <button
                                    onClick={() => { setActiveTab('complaints'); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints'
                                        ? "bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white shadow-lg shadow-red-500/20"
                                        : "text-gray-600 hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-medium">Жалобы</span>
                                </button>

                                <button
                                    onClick={() => { setActiveTab('branches'); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'branches'
                                        ? "bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white shadow-lg shadow-red-500/20"
                                        : "text-gray-600 hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    <Building2 className="w-5 h-5" />
                                    <span className="font-medium">Филиалы</span>
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users'
                                            ? "bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white shadow-lg shadow-red-500/20"
                                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                                            }`}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="font-medium">Сотрудники</span>
                                    </button>
                                )}
                            </nav>

                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Выйти</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative z-10 p-4 md:p-8 min-w-0">
                <header className="flex items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden"
                        >
                            <Menu className="w-6 h-6 text-gray-700" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'complaints' && 'Список жалоб'}
                                {activeTab === 'branches' && 'Управление филиалами'}
                                {activeTab === 'users' && 'Сотрудники'}
                            </h2>
                            <p className="text-gray-500">Обзор и управление системой</p>
                        </div>
                        <Button
                            onClick={fetchData}
                            variant="outline"
                            size="icon"
                            className="rounded-full bg-white/50 backdrop-blur-md hover:bg-white border-white/50 shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'complaints' && (
                        <motion.div
                            key="complaints"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Analytics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-blue-100 font-medium mb-1">Всего жалоб</p>
                                        <h3 className="text-4xl font-bold">{analytics.total}</h3>
                                    </div>
                                    <MessageSquare className="absolute right-4 bottom-4 w-24 h-24 text-white/10" />
                                </div>
                                <div className="bg-gradient-to-br from-[#c3161c] to-[#e63946] rounded-3xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-red-100 font-medium mb-1">Средняя оценка</p>
                                        <h3 className="text-4xl font-bold">{analytics.globalAvgRating || "0.0"}</h3>
                                    </div>
                                    <div className="absolute right-4 bottom-4 text-white/10 text-8xl font-black">★</div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-white/50 shadow-sm">
                                <div className="flex-1 min-w-[200px]">
                                    <Label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider font-semibold">Филиал</Label>
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                        <SelectTrigger className="bg-white/50 border-transparent focus:bg-white h-10 rounded-xl">
                                            <SelectValue placeholder="Все филиалы" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-transparent shadow-sm">
                                            <SelectItem value="all">Все филиалы</SelectItem>
                                            {branches.map(b => (
                                                <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <Label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider font-semibold">Сортировка</Label>
                                    <Select value={sortOrder} onValueChange={setSortOrder}>
                                        <SelectTrigger className="bg-white/50 border-transparent focus:bg-white h-10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-transparent shadow-sm">
                                            <SelectItem value="date_desc">Сначала новые</SelectItem>
                                            <SelectItem value="date_asc">Сначала старые</SelectItem>
                                            <SelectItem value="rating_asc">Сначала низкая оценка</SelectItem>
                                            <SelectItem value="rating_desc">Сначала высокая оценка</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden relative min-h-[400px]">
                                {fetching && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-[#c3161c]" />
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100  bg-gray-50/50">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Дата</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">ФИО</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Филиал</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Проблема</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Решение</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Контакты</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Оценка</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Статус</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {complaints.map((c) => (
                                                <tr key={c.id} className="hover:bg-white/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{c.fullName}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                            {c.branch}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={c.problem}>
                                                        {c.problem}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={c.solution || ""}>
                                                        {c.solution || "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{c.contact || "-"}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {c.rating ? (
                                                            <div className="flex gap-1">
                                                                {[...Array(c.rating)].map((_, i) => (
                                                                    <span key={i} className="text-amber-400 text-lg">★</span>
                                                                ))}
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-nowrap" >
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'Solved' ? 'bg-green-100 text-green-800' :
                                                            c.status === 'In progress' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {c.status === 'Solved' ? 'Решено' : c.status === 'In progress' ? 'В работе' : 'Новое'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedComplaint(c)}
                                                            className="text-gray-400 hover:text-[#c3161c] hover:bg-red-50"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {complaints.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                        Записей не найдено
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Страница {page} из {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="bg-white"
                                        >
                                            Назад
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="bg-white"
                                        >
                                            Вперед
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'branches' && (
                        <motion.div
                            key="branches"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {branches.map((b) => (
                                    <motion.div
                                        key={b.id}
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-gray-700">{b.name}</span>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteBranch(b.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                {branches.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500">
                                        Нет филиалов
                                    </div>
                                )}
                            </div>

                            {isAdmin && (
                                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg max-w-md">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-[#c3161c]" />
                                        Добавить филиал
                                    </h3>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Название филиала"
                                            value={newBranchName}
                                            onChange={(e) => setNewBranchName(e.target.value)}
                                            className="bg-white/50 border-transparent focus:bg-white"
                                        />
                                        <Button
                                            onClick={handleAddBranch}
                                            disabled={branchSubmitting}
                                            className="bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white hover:shadow-lg hover:shadow-red-500/20"
                                        >
                                            {branchSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'users' && isAdmin && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Логин</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Роль</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <UserIcon className="w-4 h-4" />
                                                    </div>
                                                    {u.username}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {u.role === 'admin' ? 'Администратор' : 'Менеджер'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-[#c3161c]" />
                                    Добавить пользователя
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <Label className="mb-2 block text-sm font-medium text-gray-700">Логин</Label>
                                        <Input
                                            placeholder="Логин"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="bg-white/50 border-transparent focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block text-sm font-medium text-gray-700">Пароль</Label>
                                        <Input
                                            type="password"
                                            placeholder="Пароль"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-white/50 border-transparent focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block text-sm font-medium text-gray-700">Роль</Label>
                                        <Select value={newUserRole} onValueChange={(val) => setNewUserRole(val as 'admin' | 'manager')}>
                                            <SelectTrigger className="bg-white/50 border-transparent focus:bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manager">Менеджер</SelectItem>
                                                <SelectItem value="admin">Администратор</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleAddUser}
                                        disabled={userSubmitting}
                                        className="bg-gradient-to-r from-[#c3161c] to-[#e63946] text-white hover:shadow-lg hover:shadow-red-500/20 w-full"
                                    >
                                        {userSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Добавить"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Complaint Details Modal */}
                    {selectedComplaint && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedComplaint(null)}
                                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-[#c3161c] rounded-xl">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Подробности жалобы</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(selectedComplaint.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedComplaint(null)}
                                        className="rounded-full hover:bg-gray-200/50"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </Button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">ФИО Клиента</Label>
                                            <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                {selectedComplaint.fullName}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Филиал</Label>
                                            <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                {selectedComplaint.branch}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Проблема</Label>
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-gray-800 whitespace-pre-wrap break-words">
                                            {selectedComplaint.problem}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Предложенное решение</Label>
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-gray-800 whitespace-pre-wrap break-words">
                                            {selectedComplaint.solution || "Нет решения"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Контакты</Label>
                                            <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                {selectedComplaint.contact || "Не указаны"}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Оценка обслуживания</Label>
                                            <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-1">
                                                {selectedComplaint.rating ? (
                                                    <>
                                                        <span className="text-lg font-bold">{selectedComplaint.rating}</span>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`text-sm ${i < (selectedComplaint.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : "Без оценки"}
                                            </div>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="pt-4 border-t border-gray-100 space-y-4">
                                            <div>
                                                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">Изменить статус</Label>
                                                <div className="flex gap-4 items-center">
                                                    <Select
                                                        value={selectedComplaint.status}
                                                        disabled={statusUpdating}
                                                        onValueChange={async (val) => {
                                                            setStatusUpdating(true);
                                                            try {
                                                                await api.patch(`/complaints/${selectedComplaint.id}`, { status: val });
                                                                // Update local state
                                                                setSelectedComplaint({ ...selectedComplaint, status: val as any });
                                                                setComplaints(complaints.map(c => c.id === selectedComplaint.id ? { ...c, status: val as any } : c));
                                                            } catch (e) {
                                                                alert('Ошибка при обновлении статуса');
                                                            } finally {
                                                                setStatusUpdating(false);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full sm:w-[200px] bg-white">
                                                            <div className="flex items-center gap-2">
                                                                {statusUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                                                                <SelectValue />
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-transparent shadow-sm">
                                                            <SelectItem value="New">Новое</SelectItem>
                                                            <SelectItem value="In progress">В работе</SelectItem>
                                                            <SelectItem value="Solved">Решено</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">Комментарий администратора</Label>
                                                <div className="flex gap-2">
                                                    <Textarea
                                                        placeholder="Введите комментарий..."
                                                        value={selectedComplaint.adminComment || ""}
                                                        onChange={(e) => setSelectedComplaint({ ...selectedComplaint, adminComment: e.target.value })}
                                                        className="bg-white"
                                                        disabled={commentSaving}
                                                    />
                                                    <Button
                                                        disabled={commentSaving}
                                                        onClick={async () => {
                                                            setCommentSaving(true);
                                                            try {
                                                                await api.patch(`/complaints/${selectedComplaint.id}`, { adminComment: selectedComplaint.adminComment });
                                                                setComplaints(complaints.map(c => c.id === selectedComplaint.id ? { ...c, adminComment: selectedComplaint.adminComment } : c));
                                                            } catch (e) {
                                                                alert('Ошибка при сохранении комментария');
                                                            } finally {
                                                                setCommentSaving(false);
                                                            }
                                                        }}
                                                    >
                                                        {commentSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                                    <Button onClick={() => setSelectedComplaint(null)}>
                                        Закрыть
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </AnimatePresence>
            </main>
        </div >
    );
}
