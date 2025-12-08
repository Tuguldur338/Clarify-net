"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="w-full sticky top-0 z-40">
      <div className="mx-auto bg-blue-400/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/website-logo.png"
              alt="website logo"
              width={140}
              height={48}
              className="w-[150px] h-[100px] object-contain hover:scale-[1.15] transition-all duration-300"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm text-white no-underline! hover:text-orange-300! transition-all duration-300 hover:underline"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm text-white no-underline! hover:text-orange-300! transition-all duration-300 hover:underline"
            >
              Contact
            </Link>

            <Link
              href="/add-knowledge"
              className="text-sm text-white no-underline! hover:text-orange-300! transition-all duration-300 hover:underline"
            >
              Add knowledge
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="flex items-center group cursor-text"
          >
            <Search className="text-white mr-2 group-hover:scale-[1.2] transition-all duration-300" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Search"
              className="hidden sm:block bg-white rounded-full px-4 py-2 w-56 text-slate-900 placeholder-slate-500 focus:outline-none backdrop-blur-sm"
            />
          </form>

          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-white no-underline! border border-white rounded hover:bg-white transition-all hover:text-black! duration-300 px-3 py-1"
                >
                  Sign in
                </Link>

                <Link
                  href="/auth/register"
                  className="text-sm text-white no-underline! border border-white rounded hover:bg-white transition-all hover:text-black! duration-300 px-3 py-1"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 group"
                  title={user.name || user.email}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white group-hover:border-orange-300 transition-all duration-300 flex items-center justify-center bg-white">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.name || "Profile"}
                        className="w-full h-full object-cover"
                        key={user.profile_picture_url}
                      />
                    ) : (
                      <span className="text-blue-600 font-bold text-lg">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <span className="text-sm text-white group-hover:text-orange-300! transition-all duration-300">
                    {user.name || "Profile"}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="text-sm text-white border border-white rounded hover:bg-white hover:text-black transition-all duration-300 px-3 py-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
