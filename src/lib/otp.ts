/**
 * Generate a random OTP (One Time Password)
 * @param length - Length of the OTP (default: 6)
 * @returns A random numeric OTP as string
 */
export function generateOTP(length: number = 6): string {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Get the expiration time for OTP verification
 * Default: 15 minutes from now
 * @param minutesFromNow - How many minutes until OTP expires
 * @returns Date object representing expiration time
 */
export function getOTPExpiration(minutesFromNow: number = 15): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutesFromNow);
  return now;
}

/**
 * Check if OTP has expired
 * @param expirationTime - The expiration time to check
 * @returns true if expired, false if still valid
 */
export function isOTPExpired(expirationTime: Date): boolean {
  return new Date() > expirationTime;
}
