const TERMINAL_COLOR__BY_KEY = {
  RESET: '\x1b[0m',
  // Regular colors
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  // Bright colors
  BRIGHT_RED: '\x1b[91m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_YELLOW: '\x1b[93m',
} as const;

const colorize = (color: keyof typeof TERMINAL_COLOR__BY_KEY, text: string) =>
  `${TERMINAL_COLOR__BY_KEY[color]}${text}${TERMINAL_COLOR__BY_KEY.RESET}`;

function validateEnv() {
  const requiredEnvVars = [
    'SECURITY__COOKIE_SECRET',
    'SECURITY__JWT_SECRET',
    'SECURITY__ENCRYPTION_KEY__MEDIUM_32',
    'SECURITY__ENCRYPTION_KEY__WEAK_8',
  ] as const;

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.error(
      colorize('RED', '❌ Missing required environment variables:'),
    );
    missingVars.forEach((key) => {
      console.error(colorize('YELLOW', `   → ${key}`));
    });
    console.error(colorize('BLUE', '\n📝 Please check your .env file'));
    process.exit(1);
  }

  // If we get here, all required vars exist
  return {
    SECURITY__COOKIE_SECRET: process.env.SECURITY__COOKIE_SECRET!,
    SECURITY__JWT_SECRET: process.env.SECURITY__JWT_SECRET!,
    SECURITY__ENCRYPTION_KEY__MEDIUM_32:
      process.env.SECURITY__ENCRYPTION_KEY__MEDIUM_32!,
    SECURITY__ENCRYPTION_KEY__WEAK_8:
      process.env.SECURITY__ENCRYPTION_KEY__WEAK_8!,
  };
}

export { validateEnv };
