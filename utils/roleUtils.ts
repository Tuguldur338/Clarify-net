// Utility functions for role management based on post count

export interface UserRole {
  title: string;
  level: number;
  color: string;
  icon: string;
}

export const ROLES: Record<string, UserRole> = {
  USER: { title: "User", level: 0, color: "gray", icon: "👤" },
  BEGINNER: { title: "Beginner", level: 1, color: "blue", icon: "🌱" },
  CONTRIBUTOR: { title: "Contributor", level: 2, color: "blue", icon: "📝" },
  EXPERT: { title: "Expert", level: 3, color: "green", icon: "🎓" },
  MASTER: { title: "Master", level: 4, color: "purple", icon: "⭐" },
  CONTENT_CREATOR: {
    title: "Content Creator",
    level: 4,
    color: "teal",
    icon: "🎬",
  },
  ADMIN: { title: "Admin", level: 5, color: "indigo", icon: "🛡️" },
  DEVELOPER: { title: "Developer", level: 6, color: "red", icon: "🛠️" },
};

/**
 * Calculate user role based on number of posts
 * - 0 posts: "User"
 * - 1 post: "Beginner"
 * - 2-3 posts: "Contributor"
 * - 4-7 posts: "Expert"
 * - 8+ posts: "Master"
 */
export function getRoleByPostCount(postCount: number): UserRole {
  if (postCount >= 8) return ROLES.MASTER;
  if (postCount >= 4) return ROLES.EXPERT;
  if (postCount >= 2) return ROLES.CONTRIBUTOR;
  if (postCount >= 1) return ROLES.BEGINNER;
  return ROLES.USER;
}

export function getRoleByName(roleName?: string): UserRole {
  if (!roleName) return ROLES.USER;
  const upper = roleName.toUpperCase().replace(/\s+/g, "_");
  return ROLES[upper] || ROLES.USER;
}

/**
 * Get the role for a user (could be "Developer" if they're the owner/creator)
 */
export function getUserRole(
  postCount: number,
  userRole?: string,
  userId?: string,
  creatorId?: string,
): UserRole {
  if (userRole) {
    const role = getRoleByName(userRole);
    if (role && role.title !== "User") {
      return role;
    }
  }

  // If user is the creator/owner, give them Developer role
  if (userId && creatorId && userId === creatorId) {
    return ROLES.DEVELOPER;
  }

  return getRoleByPostCount(postCount);
}

/**
 * Get color classes for badge display
 */
export function getRoleColorClasses(role: UserRole): {
  bg: string;
  text: string;
  border: string;
} {
  const colorMap: Record<string, any> = {
    gray: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-300",
    },
    teal: {
      bg: "bg-teal-100",
      text: "text-teal-800",
      border: "border-teal-300",
    },
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-300",
    },
    red: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  };

  return colorMap[role.color] || colorMap.gray;
}
