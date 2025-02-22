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
let guestCount = 0;

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
  let id = ++guestCount;
  tokenPlayerMap.set(token, id);
  players.set(id, { ws: null, name: "Guest" + id, isGuest: true });
  let cookie = "session=" + token + ";SameSite=Lax";
  headers.push("Set-Cookie: " + cookie);
  reqHeaders.cookie = cookie;
}

wss.on("headers", (headers, req) => {
  if (!req.headers.cookie) createGuestSession(headers, req.headers);
  else {
    let session = Cookie.parse(req.headers.cookie).session;
    if (session && tokenPlayerMap.get(session)) return;
    // If exists on database load it into tokenPlayerMap and players
    // else
    createGuestSession(headers, req.headers);
  }
});

wss.on("connection", (ws, req) => {
  let currentRoom = hub;
  let token = Cookie.parse(req.headers.cookie!).session!; // no cookies and lack of the session cookie would have been caught
  let playerID = tokenPlayerMap.get(token)!; // lack of the session token on database would have been caught
  let player = players.get(playerID)!; // loading player data should have been handled in the headers event
  ws.on("error", console.error);
  ws.on("message", (data) => currentRoom.handle(player, data));
});

// temporary
app.get("/", (_, res) => {
  res.send("<!DOCTYPE html>");
});

server.listen(process.env.PORT || 8080);
