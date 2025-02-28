import "dotenv/config";
import { createServer } from "http";
import { Server as WebSocketServer } from "ws";
import express from "express";
import * as cookie from "cookie";
import { Player } from "./player";
import { randomBytes, createHash } from "node:crypto";
import { IncomingHttpHeaders } from "node:http2";
import Hub from "./hub";
import log from "loglevel";
import { neon } from "@neondatabase/serverless";

// Global Command Codes:
// - 0xFE: Message (the recipient depends on room)
// - 0xFC: Player ID

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, maxPayload: 256 });
const sql = neon(process.env.DATABASE_URL!);
log.setDefaultLevel("info");

const tokenPlayerMap: Map<string, number> = new Map();
const playerForgetTimeouts: Map<number, NodeJS.Timeout> = new Map();
let guestCount = 0;

sql(`SELECT us.tokenstr, u.id, u.username FROM user_session AS us
JOIN "user" AS u ON us.user_id=u.id`).then((query) =>
	query.forEach((r) => {
		const player: Player = {
			id: r.id,
			isGuest: false,
			name: r.username,
			room: globalThis.hub,
			ws: null,
		};
		tokenPlayerMap.set(r.tokenstr, player.id);
		globalThis.onlinePlayers.set(player.id, player);
	}),
);

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
		room: globalThis.hub,
	});
	let expires = new Date(Date.now());
	expires.setDate(expires.getDate() + 1);
	let biscuit = cookie.serialize("session", token, {
		sameSite: "lax",
		expires,
	});
	headers.push("Set-Cookie: " + biscuit);
	reqHeaders.cookie = biscuit;
	log.info("Created guest #" + id);
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
		if (!session || !tokenPlayerMap.get(session))
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
	let player = globalThis.onlinePlayers.get(
		tokenPlayerMap.get(token)!,
	) as Player; // loading player data should have been handled in the headers event

	player.ws = ws;
	if (playerForgetTimeouts.get(player.id)) {
		clearTimeout(playerForgetTimeouts.get(player.id));
		if (player.room.onRejoin) player.room.onRejoin(player);
	}
	ws.binaryType = "nodebuffer"; // ensure recieved data type is Buffer
	sendUserInfo(player);
	log.info(`<${player.id}> connected`);

	ws.on("error", log.error);
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
					log.info(` data of <${player.name}> has been removed from memory`);
				},
				1000 * 60 * 60,
			),
		);
		log.info(`<${player.id}> disconnected`);
	});
});

async function createUserSession(
	id: number,
	name: string,
): Promise<[string, Date]> {
	const token = genSessionToken();
	tokenPlayerMap.set(token, id);
	globalThis.onlinePlayers.set(id, {
		id,
		ws: null,
		name,
		isGuest: false,
		room: hub,
	});
	let expires = new Date(Date.now());
	expires.setDate(expires.getDate() + 60);
	await sql(
		`INSERT INTO user_session (tokenstr, expiration, user_id)
 VALUES ($1, $2, ${id})`,
		[token, expires.toDateString().substring(4).replaceAll(" ", "-")],
	);
	return [token, expires];
}

app.use(express.text());

app.post("/login", async (req, res) => {
	if (typeof req.body != "string") {
		res.status(400).send("Must send login information in plain text");
		return;
	}
	let cred = req.body.split(":");
	if (cred.length != 2) {
		res.status(400).send("Must seperate username and password with a colon");
		return;
	}
	let passwdHash = createHash("sha256").update(cred[1]).digest("base64");
	try {
		let userquery = await sql(
			`SELECT id FROM "user" WHERE username='${cred[0]}' AND password_hash='${passwdHash}'`,
		);
		if (userquery.length > 0) {
			let [token, expires] = await createUserSession(userquery[0].id, cred[0]);
			res.cookie("session", token, { expires }).sendStatus(200);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		console.error(e);
		res.sendStatus(500);
	}
});

app.post("/signin", async (req, res) => {
	if (typeof req.body != "string") {
		res.status(400).send("Must send login information in plain text");
		return;
	}
	let cred = req.body.split(":");
	if (cred.length != 2) {
		res.status(400).send("Must seperate username and password with a colon");
		return;
	}
	try {
		if (
			(
				await sql(`SELECT 1 FROM "user" WHERE LOWER(username)=$1`, [
					cred[0].toLowerCase(),
				])
			).length > 0
		) {
			res.sendStatus(430);
			return;
		}
		let passwdHash = createHash("sha256").update(cred[1]).digest("base64");
		let id = (
			await sql(
				`INSERT INTO "user"(username, password_hash)
 VALUES ($1, $2) RETURNING id`,
				[cred[0], passwdHash],
			)
		)[0].id;
		const [token, expires] = await createUserSession(id, cred[0]);
		res.cookie("session", token, { expires: expires }).sendStatus(200);
	} catch (e) {
		console.error(e);
		res.sendStatus(500);
	}
});

log.info("server started");
server.listen(process.env.PORT || 8080);
