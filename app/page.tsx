"use client";

import Image from "next/image";
import Link from "next/link";
import ComplaintWizard from "@/components/forms/ComplaintWizard";
import AnimatedBackground from "@/components/ui/Background";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <main className="min-h-screen flex flex-col items-center justify-center p-2 md:p-4 relative z-10">
        {/* Admin Link (Top Right) */}
        <div className="absolute top-2 right-2 z-50">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/40 text-gray-700">
              <ShieldAlert className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Hero section */}
        <div className="w-fit mb-10 text-center space-y-6">
          {/* Logo container with dramatic glow */}
          <div className="relative flex items-center justify-center mb-8 gap-4">
            <Image
              src="/plovster_logo.png"
              alt="Plovster Logo"
              width={80}
              height={80}
              className="relative drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              priority
            />
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-[#c3161c] via-[#e63946] to-[#c3161c] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                PLOVSTER
              </span>
              <span className="align-super text-sm text-[#c3161c]/40 ml-1">©</span>
            </h1>

          </div>

          {/* Title */}
          <div className="space-y-2">

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c3161c]/30" />
              <span className="text-sm font-medium text-gray-600 tracking-widest uppercase">Книга жалоб и предложений</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c3161c]/30" />
            </div>

            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Ваше мнение помогает нам становиться лучше
            </p>
          </div>
        </div>

        {/* Form with Glassmorphism */}
        <div className="relative w-full max-w-[1000px]">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#8ed7f7]/30 via-[#c3161c]/20 to-[#fdcf9d]/30 rounded-[2.5rem] blur-xl opacity-60" />

          {/* Card container */}
          <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-2xl shadow-black/5 border border-white/60 overflow-hidden">
            <ComplaintWizard />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center pb-6">
          <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
            <span className="font-medium opacity-50">© {new Date().getFullYear()} Plovster. Все права защищены.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
