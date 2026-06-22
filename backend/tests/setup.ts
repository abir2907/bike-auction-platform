// Minimal env required for the config module to validate during tests.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/vutto_test?schema=public';
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret-which-is-long-enough';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-which-is-long-enough';
process.env.LOG_LEVEL ||= 'error';
process.env.METRICS_ENABLED ||= 'false';
