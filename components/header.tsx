"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/posts?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json?.data) {
          const mainSubjects = [
            "math",
            "science",
            "english",
            "history",
            "pe",
            "physical education",
            "computer science",
            "programming",
            "art",
            "music",
            "geography",
            "economics",
            "psychology",
          ];

          // Group by main subject topics
          const topicMap = new Map<string, number>();
          json.data.forEach((post: any) => {
            if (post.topic) {
              const topicKey = post.topic.toLowerCase();
              if (mainSubjects.includes(topicKey)) {
                topicMap.set(topicKey, (topicMap.get(topicKey) || 0) + 1);
              }
            }
          });

          const topicItems = Array.from(topicMap.entries())
            .map(([topic, count]) => ({
              type: "topic" as const,
              value: topic.charAt(0).toUpperCase() + topic.slice(1),
              count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

          // Also include individual matching post titles
          const seenTitles = new Set<string>();
          const postItems = json.data
            .filter((post: any) => {
              if (!post.title) return false;
              const key = post.title.toLowerCase();
              if (seenTitles.has(key)) return false;
              seenTitles.add(key);
              return true;
            })
            .slice(0, 4)
            .map((post: any) => ({
              type: "post" as const,
              value: post.title,
              id: post.id,
              topic: post.topic,
            }));

          const items = [...topicItems, ...postItems].slice(0, 8);

          setSuggestions(items);
          setShowSuggestions(true);
          setHighlightedIndex(-1);
        }
      } catch (e) {
        console.error("Suggestion fetch error:", e);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timer);
  }, [q]);

  const handleSearch = (searchTerm: string = q) => {
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowSuggestions(false);
    setQ("");
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === "post" && suggestion.id) {
      router.push(`/p/${suggestion.id}`);
      setShowSuggestions(false);
      setQ("");
    } else {
      handleSearch(suggestion.value);
    }
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
  }, [pathname]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <header className="w-full sticky top-0 z-40">
      <div className="mx-auto bg-blue-400/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/website_logo_1.jpeg"
              alt="website logo"
              width={140}
              height={48}
              className="w-[70px] h-[70px] object-contain hover:scale-[1.15] transition-all duration-300 rounded-full!"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm inline-block relative no-underline! hover:border-gradient-to-r"
              onMouseEnter={() => setHoveredLink("about")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span
                className="transition-opacity duration-500"
                style={{
                  opacity: hoveredLink === "about" ? 0 : 1,
                  color: "white",
                }}
              >
                About
              </span>
              <span
                className="absolute left-0 top-0 transition-opacity duration-500"
                style={{
                  opacity: hoveredLink === "about" ? 1 : 0,
                  background:
                    "linear-gradient(to right, #facc15, #ef4444, #ec4899)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                About
              </span>
            </Link>

            <Link
              href="/contact"
              className="text-sm inline-block relative no-underline!"
              onMouseEnter={() => setHoveredLink("contact")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span
                className="transition-opacity duration-500"
                style={{
                  opacity: hoveredLink === "contact" ? 0 : 1,
                  color: "white",
                }}
              >
                Contact
              </span>
              <span
                className="absolute left-0 top-0 transition-opacity duration-500"
                style={{
                  opacity: hoveredLink === "contact" ? 1 : 0,
                  background:
                    "linear-gradient(to right, #facc15, #ef4444, #ec4899)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Contact
              </span>
            </Link>

            <Link
              href="/add-knowledge"
              className="text-sm inline-block relative no-underline!"
              onMouseEnter={() => setHoveredLink("add-knowledge")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <span
                className="transition-opacity duration-500"
                style={{
                  opacity: hoveredLink === "add-knowledge" ? 0 : 1,
                  color: "white",
                }}
              >
                Add knowledge
              </span>
              <span
                className="absolute left-0 top-0 transition-opacity duration-500"
                style={{
                  opacity: hoveredLink === "add-knowledge" ? 1 : 0,
                  background:
                    "linear-gradient(to right, #facc15, #ef4444, #ec4899)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Add knowledge
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center group cursor-text relative"
          >
            <Search className="text-white mr-2 group-hover:scale-[1.2] transition-all duration-300" />

            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => q.trim() && setShowSuggestions(true)}
              type="text"
              placeholder="Search Subtopics like Algebra or Chemistry..."
              className="hidden sm:block bg-white rounded-full px-4 py-2 w-90! text-slate-900 placeholder-slate-500 focus:outline-none backdrop-blur-sm"
              autoComplete="off"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                style={{ marginLeft: "2.5rem" }}
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      highlightedIndex === idx
                        ? "bg-blue-100 text-blue-900"
                        : "hover:bg-gray-50 text-gray-800"
                    } border-b last:border-b-0`}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{suggestion.value}</div>
                        <div className="text-xs text-gray-500">
                          {suggestion.type === "topic"
                            ? `${suggestion.count} post${suggestion.count !== 1 ? "s" : ""}`
                            : suggestion.topic
                              ? `in ${suggestion.topic}`
                              : "Post"}
                        </div>
                      </div>
                      <Search size={16} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                  className="flex items-center gap-2 group no-underline! hover:underline! transition-all"
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
