import "dotenv/config";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";
import express from "express";
import Cookie from "cookie";
import { Player } from "./player";
import { randomBytes } from "node:crypto";
import { IncomingHttpHeaders } from "node:http2";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const players: Map<number, Player> = new Map();
const tokenPlayerMap: Map<string, number> = new Map();

function genSessionToken(): string {
  let buf = randomBytes(40);
  buf.writeBigUInt64BE(BigInt(Date.now()));
  return buf.toString("base64url");
}

function createGuestSession(
  headers: string[],
  reqHeaders: IncomingHttpHeaders,
) {
  let token = genSessionToken();
  tokenPlayerMap.set(token, Date.now());
  let cookie = "session=" + token + ";SameSite=Lax";
  headers.push("Set-Cookie: " + cookie);
  reqHeaders.cookie = cookie;
}

wss.on("headers", (headers, req) => {
  if (!req.headers.cookie) createGuestSession(headers, req.headers);
  else {
    let session = Cookie.parse(req.headers.cookie).session;
    if (!session || !tokenPlayerMap.get(session))
      createGuestSession(headers, req.headers);
    // If exists on database load it into tokenPlayerMap
  }
});

wss.on("connection", (ws, req) => {
  ws.on("error", console.error);
  ws.on("message", (data) => {});
});

// temporary
app.get("/", (_, res) => {
  res.send("<!DOCTYPE html>");
});

server.listen(process.env.PORT || 8080);
