"use client";
import React, { useState } from "react";
import Link from "next/link";
import { LoginModal } from "./login";

interface NavLink {
    name: string;
    href: string;
}

const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "News & Updates", href: "/updates" },
];

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{name: string; role: string} | null>(null);

    return (
        <>
            <header className="sticky top-0 z-40 bg-[#0F0F19]/95 backdrop-blur-sm border-b border-[#875FFF]/10">
                <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between text-white">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[#875FFF] flex items-center justify-center">
                            <span className="text-[10px] text-[#875FFF] font-bold">AI</span>
                        </div>
                        <span className="font-extrabold text-lg tracking-wide">AI CLUB</span>
                    </Link>

                    <ul className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className="text-sm font-medium text-gray-300 hover:text-white transition relative pb-1"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-3">
                        <a
                            href="#login"
                            className="hidden sm:inline-block text-sm font-bold py-2 px-4 rounded-lg bg-[#875FFF] hover:bg-[#6e46cc] text-white transition"
                            onClick={(e) => { e.preventDefault(); setIsLoginOpen(true); }}
                        >
                            Member Login
                        </a>

                        <button
                            onClick={() => setIsMenuOpen((v) => !v)}
                            className="lg:hidden p-2 rounded-lg hover:bg-[#1a1a2e]"
                            aria-label="Toggle Menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </nav>

                {isMenuOpen && (
                    <div className="lg:hidden border-t border-[#875FFF]/10 bg-[#0F0F19]">
                        <ul className="px-4 py-3 space-y-2">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="block w-full rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-[#1a1a2e]"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="#login"
                                    className="block w-full text-center rounded-md px-3 py-2 text-sm font-bold bg-[#875FFF] hover:bg-[#6e46cc] text-white"
                                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setIsLoginOpen(true); }}
                                >
                                    Member Login
                                </a>
                            </li>
                        </ul>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            <LoginModal
                open={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLogin={({ role, name, userId }) => {
                    console.log("Demo login:", { role, name, userId });
                    setUserInfo({ name, role });
                    setUserId(userId);
                    setIsLoginOpen(false);
                }}
            />

            {/* Simple userId banner at bottom of page */}
            {userId && (
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/70 text-gray-200 text-xs sm:text-sm px-3 py-2 text-center">
                Logged in as {userInfo?.name} ({userInfo?.role}) • UserID: <span className="text-[#875FFF] font-semibold">{userId}</span>
              </div>
            )}
        </>
    );
}
