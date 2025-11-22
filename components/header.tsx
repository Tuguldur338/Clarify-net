"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("clarifynet_user");
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      setUser(null);
    }
  }, []);

  const [q, setQ] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="w-full py-4 sticky top-0 z-40 bg-transparent">
      <div className="mx-auto max-w-screen w-[95%] bg-[#2D6CDF] rounded-2xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/website-logo.png"
              alt="website logo"
              width={140}
              height={48}
              className="w-[150px] h-[100px] object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm text-white !no-underline hover:underline"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm text-white !no-underline hover:underline"
            >
              Contact
            </Link>

            <Link
              href="/add-knowledge"
              className="text-sm text-white !no-underline hover:underline"
            >
              Add knowledge
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center">
            <Search className="text-white mr-2" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Search"
              className="hidden sm:block bg-white rounded-full px-4 py-2 w-56 text-slate-900 placeholder-slate-500 focus:outline-none"
            />
          </form>

          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-white !no-underline border border-white rounded hover:bg-white transition-all hover:!text-black duration-300 px-3 py-1"
                >
                  Sign in
                </Link>

                <Link
                  href="/auth/register"
                  className="text-sm text-white !no-underline border border-white rounded hover:bg-white transition-all hover:!text-black duration-300 px-3 py-1"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-white !no-underline"
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    try {
                      localStorage.removeItem("clarifynet_user");
                    } catch (e) {}
                    setUser(null);
                    router.push("/");
                  }}
                  className="text-sm text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
