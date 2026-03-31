import React from "react";
import { UserRole, getRoleColorClasses } from "@/utils/roleUtils";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const colors = getRoleColorClasses(role);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div
      className={`${colors.bg} ${colors.text} ${sizeClasses[size]} rounded-full font-semibold inline-flex items-center gap-1 border ${colors.border}`}
    >
      <span>{role.icon}</span>
      <span>{role.title}</span>
    </div>
  );
}
