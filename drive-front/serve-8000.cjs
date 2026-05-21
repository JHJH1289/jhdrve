const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || "0.0.0.0";
const distDir = path.join(__dirname, "dist");
const backend = new URL(process.env.API_PROXY_TARGET || "http://localhost:8080");

const types = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendFile(response, filePath) {
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function proxyApi(request, response) {
  const target = new URL(request.url, backend);
  const headers = { ...request.headers, host: backend.host };

  const proxy = http.request(
    {
      hostname: backend.hostname,
      port: backend.port || 80,
      path: target.pathname + target.search,
      method: request.method,
      headers,
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(response);
    },
  );

  proxy.on("error", (error) => {
    response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`API proxy error: ${error.message}`);
  });

  request.pipe(proxy);
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/")) {
    proxyApi(request, response);
    return;
  }

  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(distDir, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(distDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (!error && stat.isFile()) {
      sendFile(response, filePath);
      return;
    }

    sendFile(response, path.join(distDir, "index.html"));
  });
});

server.listen(port, host, () => {
  console.log(`Drive frontend listening on http://${host}:${port}`);
  console.log(`Proxying /api to ${backend.origin}`);
});
