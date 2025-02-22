import "dotenv/config";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";
import express from "express";
import * as cookie from "cookie";
import { Player } from "./player";
import { randomBytes } from "node:crypto";
import { IncomingHttpHeaders } from "node:http2";
import Hub from "./hub";
import { readFile } from "node:fs/promises";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, maxPayload: 256 });

const players: Map<number, Player> = new Map();
const tokenPlayerMap: Map<string, number> = new Map();
let guestCount = 0;
const hub = new Hub();

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
  players.set(id, {
    id,
    ws: null,
    name: "Guest" + id,
    isGuest: true,
    room: hub,
  });
  let expires = new Date(Date.now());
  expires.setDate(expires.getDate() + 1);
  let biscuit = cookie.serialize("session", token, {
    sameSite: "lax",
    expires,
  });
  headers.push("Set-Cookie: " + biscuit);
  reqHeaders.cookie = biscuit;
}

function handleChatMsg(sender: Player, msg: Buffer): boolean {
  if (msg[0] != 250) return false;
  if (msg.length > 5) {
    const recipient = players.get(msg.readUInt32BE(1));
    if (recipient?.ws) {
      msg.writeUInt8(250, 0);
      msg.writeUInt32BE(sender.id, 1);
      recipient.ws.send(msg);
    }
  }
  return true;
}

wss.on("headers", (headers, req) => {
  if (!req.headers.cookie) createGuestSession(headers, req.headers);
  else {
    let session = cookie.parse(req.headers.cookie).session;
    if (session && tokenPlayerMap.get(session)) return;
    // If exists on database load it into tokenPlayerMap and players
    // else
    createGuestSession(headers, req.headers);
  }
});

wss.on("connection", (ws, req) => {
  let token = cookie.parse(req.headers.cookie!).session!; // no cookies and lack of the session cookie would have been caught
  let player = players.get(tokenPlayerMap.get(token)!)!; // loading player data should have been handled in the headers event
	player.ws = ws;
  ws.binaryType = "nodebuffer"; // ensure recieved data type is Buffer
  ws.on("error", console.error);
  ws.on("message", (data) => {
    // assumption is safe because ws.binaryType = "nodebuffer"
    if (!handleChatMsg(player, data as Buffer))
      player.room.onMessage(player, data as Buffer);
  });
  ws.on("close", () => {
		player.ws = null;
    if (player.room.onDisconnect) player.room.onDisconnect(player);
  });
});

// temporary
app.get("/", async (_, res) => {
	res.send("<!DOCTYPE html><script>" + await readFile('test.js') + "</script>");
});

server.listen(process.env.PORT || 8080);
