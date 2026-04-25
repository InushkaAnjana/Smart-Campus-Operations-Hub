/**
 * userUtils.js - User Display Logic Helpers
 */

/**
 * Returns a user-friendly display name.
 * 
 * Logic:
 * 1. If user.name is valid and not a placeholder ("Google User", "User"), use it.
 * 2. If name is a placeholder or missing, try to extract name from email prefix.
 * 3. Fallback to "Guest".
 * 
 * @param {Object} user - The user object from localStorage/AuthContext
 * @returns {String} - The resolved display name
 */
export const getDisplayName = (user) => {
  if (!user) return 'Guest';

  const name = user.name || '';
  const email = user.email || '';

  // Check if the current name is a generic placeholder
  const isPlaceholder = 
    name.toLowerCase() === 'google user' || 
    name.toLowerCase() === 'user' || 
    name.trim() === '';

  if (!isPlaceholder) {
    return name;
  }

  // Fallback to email prefix (john.doe@gmail.com -> john.doe)
  if (email.includes('@')) {
    return email.split('@')[0];
  }

  return name || 'User';
};

/**
 * Returns the first character of the display name for an avatar.
 */
export const getAvatarInitial = (user) => {
  const displayName = getDisplayName(user);
  return displayName.charAt(0).toUpperCase() || 'U';
};
