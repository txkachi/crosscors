# crosscors

[![npm version](https://img.shields.io/npm/v/crosscors.svg)](https://www.npmjs.com/package/crosscors)
[![npm downloads](https://img.shields.io/npm/dm/crosscors.svg)](https://www.npmjs.com/package/crosscors)
[![license](https://img.shields.io/npm/l/crosscors.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/crosscors.svg)](https://www.npmjs.com/package/crosscors)

**GitHub:** [https://www.github.com/txkachi/crosscors](https://www.github.com/txkachi/crosscors)

**crosscors** — A blazing fast, advanced CORS middleware for Node.js.

## Features

- Origin control (string, RegExp, function, array)
- Method, header, credentials, maxAge, exposedHeaders, preflight, vary, dynamic config
- Advanced logging (optional)
- Preflight (OPTIONS) handling
- No frameworks or helper modules required
- Full TypeScript type safety

## Installation

```bash
npm install crosscors
```

## Usage

```typescript
import http from "http";
import { crosscors } from "crosscors";

const cors = crosscors({
  origin: ["http://localhost:3000", /example\\.com$/],
  methods: ["GET", "POST"],
  credentials: true,
  maxAge: 3600,
  log: true,
});

const server = http.createServer(async (req, res) => {
  if (await cors(req, res)) return;
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "CORS successful with crosscors!" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
```

## Example

See [`example/server.js`](./example/server.js) for a ready-to-run Node.js server using crosscors.

## Test

You can run tests with:

```bash
npm test
```

## API

### crosscors(options)

| Option               | Type                            | Description                           |
| -------------------- | ------------------------------- | ------------------------------------- |
| origin               | string, RegExp, array, function | Allowed origin(s)                     |
| methods              | string[]                        | Allowed HTTP methods                  |
| allowedHeaders       | string[]                        | Allowed request headers               |
| exposedHeaders       | string[]                        | Headers exposed to the client         |
| credentials          | boolean                         | Allow cookies/credentials             |
| maxAge               | number                          | Preflight cache duration (seconds)    |
| preflightContinue    | boolean                         | Call next handler on OPTIONS requests |
| optionsSuccessStatus | number                          | Status code for successful preflight  |
| log                  | boolean                         | Enable advanced logging               |

## License

MIT — see [LICENSE](./LICENSE)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history and updates.
