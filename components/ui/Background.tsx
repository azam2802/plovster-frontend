"use client";

export default function Background() {
    return (
        <div className="fixed inset-0 overflow-hidden -z-10 bg-[#f8fafc]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),_rgba(255,255,255,0))]" />

            <div
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-300/30 rounded-full blur-[100px]"
            />

            <div
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-300/30 rounded-full blur-[120px]"
            />

            <div
                className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-purple-300/20 rounded-full blur-[90px]"
            />
        </div>
    );
}
