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

// Global Command Codes:
// - 0xFE: Message (the recipient depends on room)
// - 0xFC: Player ID

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, maxPayload: 256 });

const tokenPlayerMap: Map<string, number> = new Map();
const playerForgetTimeouts: Map<number, NodeJS.Timeout> = new Map();
let guestCount = 0;

globalThis.onlinePlayers = new Map();
globalThis.hub = new Hub();

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
	let id = guestCount++;
	tokenPlayerMap.set(token, id);
	globalThis.onlinePlayers.set(id, {
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
		const recipient = globalThis.onlinePlayers.get(msg.readUInt32BE(1));
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

function sendUserInfo(player: Player) {
	const serPlayerID = Buffer.alloc(4);
	serPlayerID.writeInt32BE(player.id);
	player.ws!.send(serPlayerID);
}

wss.on("connection", (ws, req) => {
	let token = cookie.parse(req.headers.cookie!).session!; // no cookies and lack of the session cookie would have been caught
	let player = globalThis.onlinePlayers.get(tokenPlayerMap.get(token)!)!; // loading player data should have been handled in the headers event

	player.ws = ws;
	if (playerForgetTimeouts.get(player.id)) {
		clearTimeout(playerForgetTimeouts.get(player.id));
		if (player.room.onRejoin) player.room.onRejoin(player);
	}
	ws.binaryType = "nodebuffer"; // ensure recieved data type is Buffer
	sendUserInfo(player);

	ws.on("error", console.error);
	ws.on("message", (data) => {
		// assumption is safe because ws.binaryType = "nodebuffer"
		if (!handleChatMsg(player, data as Buffer))
			player.room.onMessage(player, data as Buffer);
	});
	ws.on("close", () => {
		player.ws = null;
		if (player.room.onDisconnect) player.room.onDisconnect(player);
		playerForgetTimeouts.set(
			player.id,
			setTimeout(
				() => {
					globalThis.onlinePlayers.delete(player.id);
					tokenPlayerMap.delete(token);
				},
				1000 * 60 * 60,
			),
		);
	});
});

server.listen(process.env.PORT || 8080);
