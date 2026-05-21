import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <footer
      className="w-full py-10 mt-16"
      style={{
        backgroundColor: "var(--footer-background)",
        color: "var(--footer-foreground)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/website_logo_1.jpeg"
              alt="ClarifyNet logo"
              width={500}
              height={500}
              className="rounded-full w-[100px] h-[100px]"
            />

            <h2 className="text-xl font-semibold">ClarifyNet</h2>
          </div>

          <p className="mt-3">
            A place where learning becomes clear and simple.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Navigation</h3>

          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                href="/search"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                Search
              </Link>
            </li>

            <li>
              <Link
                href="/topics"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                Topics
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Follow</h3>

          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                Instagram
              </Link>
            </li>

            <li>
              <Link
                href="#"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                YouTube
              </Link>
            </li>

            <li>
              <Link
                href="#"
                className="no-underline! hover:text-orange-300! transition-all duration-300"
              >
                Twitter
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mt-10 border-t pt-5 text-center"
        style={{ borderColor: "var(--footer-border)" }}
      >
        © {new Date().getFullYear()} ClarifyNet. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
