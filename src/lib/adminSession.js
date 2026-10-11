/** The board password is remembered for this browser tab only (shared by /admin and /loggin). */
export const ADMIN_SESSION_KEY = "ts-admin-password";

export function readAdminSession() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) || "";
  } catch {
    return "";
  }
}

export function writeAdminSession(value) {
  try {
    if (value) sessionStorage.setItem(ADMIN_SESSION_KEY, value);
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* private mode – password just isn't remembered */
  }
}
