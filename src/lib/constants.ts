/**
 * Application-wide constants
 */

export const INITIAL_SIGN_IN_STATE = {
  status: "idle" as const,
  message: null as string | null,
};

export const INITIAL_SIGN_UP_STATE = {
  status: "idle" as const,
  message: null as string | null,
};
