"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { X, LogIn, User, ChevronDown, LayoutDashboard, Home } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
        }
      } catch (e) {}
    };

    fetchUser();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginName, email: loginEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowLoginModal(false);
        router.push("/dashboard");
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setLoginError("An unexpected error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <nav
      className={twMerge(
        clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out py-6",
          scrolled ? "bg-[var(--color-off-white)] shadow-sm" : "bg-transparent"
        )
      )}
    >
      <div className="max-w-[1440px] w-full mx-auto px-12 md:px-24 flex items-center justify-between">
        {/* Logo */}
        <a href="https://dc.kgec.tech/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-[var(--color-borders)] group-hover:border-[var(--color-japan-red)] transition-colors">
            <img src="/logo.jpg" alt="Dev Community Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col ml-1">
            <span className="text-[10px] leading-none tracking-[0.2em] text-[var(--color-secondary-text)] mb-1 uppercase group-hover:text-[var(--color-japan-red)] transition-colors">Dev</span>
            <span className="font-onari text-2xl leading-none tracking-widest text-[var(--color-japan-red)] font-normal uppercase">Community</span>
          </div>
        </a>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-10">
          {["HOME", "LEVELS", "TIMELINE", "MENTORS", "PRIZES", "CONTACT"].map((link, i) => (
            <a
              key={link}
              href={link === "HOME" ? "/" : `#${link.toLowerCase()}`}
              className={clsx(
                "text-xs tracking-widest font-medium transition-colors hover:text-[var(--color-japan-red)] relative group",
                i === 0 ? "text-[var(--color-japan-red)]" : "text-[var(--color-primary-text)]"
              )}
            >
              {link}
              {i === 0 && (
                <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-[var(--color-japan-red)]"></span>
              )}
              {i !== 0 && (
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[var(--color-japan-red)] transition-all duration-300 group-hover:w-full"></span>
              )}
            </a>
          ))}
          {userData ? (
            <div className="relative ml-2">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-xs tracking-widest font-medium text-[#111111] bg-white border border-[#D8D0C8] hover:border-[var(--color-japan-red)] px-4 py-2 rounded-full transition-all duration-300 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-japan-red)] text-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[100px] truncate">{userData.name}</span>
                <ChevronDown className="w-4 h-4 text-[#777777]" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D8D0C8] rounded-xl shadow-lg py-2 animate-slide-up-fade">
                  <button
                    onClick={() => { setShowDropdown(false); router.push("/"); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#FAF8F4] hover:text-[var(--color-japan-red)] transition-colors"
                  >
                    <Home className="w-4 h-4" /> Home
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); router.push("/dashboard"); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#FAF8F4] hover:text-[var(--color-japan-red)] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 text-xs tracking-widest font-medium text-[var(--color-off-white)] bg-[#111111] hover:bg-[var(--color-japan-red)] px-6 py-2.5 rounded-sm transition-all duration-300 uppercase shadow-sm ml-2"
            >
              <LogIn className="w-4 h-4" />
              Continue Journey
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF8F4] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-[#D8D0C8] animate-slide-up-fade">
            <div className="p-6 border-b border-[#D8D0C8] flex justify-between items-center bg-white">
              <h3 className="font-onari text-2xl text-[#8A2722]">Login</h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-[#777777] hover:text-[#111111] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-2 font-sans">Name</label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    required
                    placeholder="Enter your registered name"
                    className="w-full h-[48px] px-4 bg-white border border-[#D8D0C8] rounded-lg text-[#111111] placeholder-[#A0A0A0] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-2 font-sans">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Enter your registered email"
                    className="w-full h-[48px] px-4 bg-white border border-[#D8D0C8] rounded-lg text-[#111111] placeholder-[#A0A0A0] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all"
                  />
                </div>
                {loginError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center font-sans border border-red-100">
                    {loginError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn || !loginName || !loginEmail}
                  className="w-full h-[48px] bg-[#B93A32] hover:bg-[#8A2722] text-[#F7F3EE] rounded-lg font-sans font-medium transition-all duration-300 disabled:opacity-70 flex items-center justify-center mt-2 shadow-sm"
                >
                  {isLoggingIn ? "Authenticating..." : "Login to Dashboard"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
