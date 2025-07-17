import { IncomingMessage, ServerResponse } from 'http';

/**
 * Type for allowed CORS origins.
 * Can be a string, RegExp, array, or a function for dynamic matching.
 */
export type CrossCorsOrigin =
  | string
  | RegExp
  | Array<string | RegExp>
  | ((origin: string | undefined, req: IncomingMessage) => boolean | Promise<boolean>);

/**
 * Options for configuring crosscors middleware.
 */
export interface CrossCorsOptions {
  origin?: CrossCorsOrigin; // Allowed origins
  methods?: string[]; // Allowed HTTP methods
  allowedHeaders?: string[]; // Allowed request headers
  exposedHeaders?: string[]; // Headers exposed to the client
  credentials?: boolean; // Allow cookies/credentials
  maxAge?: number; // Preflight cache duration (seconds)
  preflightContinue?: boolean; // Call next handler on OPTIONS requests
  optionsSuccessStatus?: number; // Status code for successful preflight
  log?: boolean; // Enable advanced logging
}

/**
 * Matches the request origin against the configured origin(s).
 * Supports string, RegExp, array, and sync/async function.
 */
function matchOrigin(
  ruleOrigin: CrossCorsOrigin | undefined,
  reqOrigin: string | undefined,
  req: IncomingMessage
): Promise<boolean> {
  if (!ruleOrigin) return Promise.resolve(true); // Default: allow all origins
  if (!reqOrigin) return Promise.resolve(false);
  if (typeof ruleOrigin === 'string') return Promise.resolve(ruleOrigin === '*' || ruleOrigin === reqOrigin);
  if (ruleOrigin instanceof RegExp) return Promise.resolve(ruleOrigin.test(reqOrigin));
  if (Array.isArray(ruleOrigin)) {
    return Promise.resolve(
      ruleOrigin.some((o) =>
        typeof o === 'string' ? o === reqOrigin : o instanceof RegExp ? o.test(reqOrigin) : false
      )
    );
  }
  if (typeof ruleOrigin === 'function') {
    const result = ruleOrigin(reqOrigin, req);
    return result instanceof Promise ? result : Promise.resolve(result);
  }
  return Promise.resolve(false);
}

/**
 * crosscors - Advanced, framework-free, and type-safe CORS middleware for Node.js
 * @param options CrossCorsOptions
 * @returns Middleware function for Node.js http/https server
 */
export function crosscors(options: CrossCorsOptions = {}) {
  const {
    origin = '*',
    methods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders,
    exposedHeaders,
    credentials = false,
    maxAge,
    preflightContinue = false,
    optionsSuccessStatus = 204,
    log = false,
  } = options;

  return async function handleCors(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const reqOrigin = req.headers.origin;
    const reqMethod = req.method ? req.method.toUpperCase() : '';

    if (!(await matchOrigin(origin, reqOrigin, req))) {
      if (log && reqOrigin) console.warn(`[crosscors] Blocked: ${reqOrigin}`);
      return false;
    }

    // Set CORS headers
    if (reqOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : reqOrigin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', methods.join(','));
    if (allowedHeaders) {
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(','));
    } else if (req.headers['access-control-request-headers']) {
      res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    }
    if (exposedHeaders) {
      res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(','));
    }
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (maxAge !== undefined) {
      res.setHeader('Access-Control-Max-Age', String(maxAge));
    }

    if (log && reqOrigin) console.info(`[crosscors] Allowed: ${reqOrigin}`);

    // Handle preflight (OPTIONS) requests
    if (reqMethod === 'OPTIONS') {
      if (preflightContinue) return false;
      res.statusCode = optionsSuccessStatus;
      res.end();
      return true;
    }
    return false;
  };
} 