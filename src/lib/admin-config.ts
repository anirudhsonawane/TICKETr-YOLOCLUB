// Admin configuration for authorized users
export const ADMIN_CONFIG = {
  // List of authorized admin email addresses
  authorizedAdmins: [
    'anirudhsonawane111@gmail.com',
    // Add more admin emails here as needed
    // 'admin2@example.com',
    // 'admin3@example.com',
  ],
  
  // Admin panel settings
  settings: {
    // Maximum number of pending payments to show per page
    maxPendingPaymentsPerPage: 20,
    
    // Auto-refresh interval for payment list (in milliseconds)
    refreshInterval: 30000, // 30 seconds
    
    // Payment verification timeout (in hours)
    verificationTimeout: 24,
  }
};

// Check if user is authorized admin
export function isAuthorizedAdmin(userEmail: string): boolean {
  return ADMIN_CONFIG.authorizedAdmins.includes(userEmail.toLowerCase());
}

// Get admin settings
export function getAdminSettings() {
  return ADMIN_CONFIG.settings;
}
