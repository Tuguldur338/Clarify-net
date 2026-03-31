// Utility functions for role management based on post count

export interface UserRole {
  title: string;
  level: number;
  color: string;
  icon: string;
}

export const ROLES: Record<string, UserRole> = {
  USER: { title: "User", level: 0, color: "gray", icon: "👤" },
  CONTRIBUTOR: { title: "Contributor", level: 1, color: "blue", icon: "📝" },
  EXPERT: { title: "Expert", level: 2, color: "green", icon: "🎓" },
  MASTER: { title: "Master", level: 3, color: "purple", icon: "⭐" },
  DEVELOPER: { title: "Developer", level: 4, color: "red", icon: "🛠️" },
};

/**
 * Calculate user role based on number of posts
 * - 0 posts: "User"
 * - 1-2 posts: "Contributor"
 * - 3-5 posts: "Expert"
 * - 6+ posts: "Master"
 */
export function getRoleByPostCount(postCount: number): UserRole {
  if (postCount >= 6) return ROLES.MASTER;
  if (postCount >= 3) return ROLES.EXPERT;
  if (postCount >= 1) return ROLES.CONTRIBUTOR;
  return ROLES.USER;
}

/**
 * Get the role for a user (could be "Developer" if they're the owner/creator)
 */
export function getUserRole(
  postCount: number,
  userId?: string,
  creatorId?: string,
): UserRole {
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
    red: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  };

  return colorMap[role.color] || colorMap.gray;
}
