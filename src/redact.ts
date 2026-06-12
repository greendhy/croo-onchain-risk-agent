const CROO_KEY_PREFIX = ["croo", "sk"].join("_");
const CROO_KEY_RE = new RegExp(`${CROO_KEY_PREFIX}_[A-Za-z0-9]+`, "g");

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(CROO_KEY_RE, `${CROO_KEY_PREFIX}_****REDACTED`);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, redactSecrets(item)]),
    );
  }

  return value;
}

export function createRedactingLogger(base: Console = console): Console {
  return {
    ...base,
    info(message?: unknown, ...optionalParams: unknown[]) {
      base.info(redactSecrets(message), ...optionalParams.map((param) => redactSecrets(param)));
    },
    warn(message?: unknown, ...optionalParams: unknown[]) {
      base.warn(redactSecrets(message), ...optionalParams.map((param) => redactSecrets(param)));
    },
    error(message?: unknown, ...optionalParams: unknown[]) {
      base.error(redactSecrets(message), ...optionalParams.map((param) => redactSecrets(param)));
    },
    debug(message?: unknown, ...optionalParams: unknown[]) {
      base.debug(redactSecrets(message), ...optionalParams.map((param) => redactSecrets(param)));
    },
  };
}
