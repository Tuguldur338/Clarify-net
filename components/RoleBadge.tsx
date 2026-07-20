import React from "react";
import { UserRole, getRoleColorClasses } from "@/utils/roleUtils";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const colors = getRoleColorClasses(role);

  const isVerified = role.title === "Content Creator";
  const isDeveloper = role.title === "Developer";

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const accentClasses = isVerified
    ? "ring-2 ring-teal-300 shadow-sm"
    : isDeveloper
      ? "ring-2 ring-red-300 shadow-sm"
      : "";

  return (
    <div
      className={`${colors.bg} ${colors.text} ${sizeClasses[size]} rounded-full font-semibold inline-flex items-center gap-2 border ${colors.border} ${accentClasses}`}
    >
      <span>{role.icon}</span>
      <span>{role.title}</span>
      {isVerified ? (
        <span className="inline-flex items-center justify-center rounded-full bg-teal-500 text-white text-[10px] w-5 h-5">
          ✔
        </span>
      ) : null}
    </div>
  );
}
