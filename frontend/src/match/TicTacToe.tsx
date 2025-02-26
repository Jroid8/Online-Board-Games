import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "./GameState";
import { useParams } from "react-router";

enum BoardSlot {
	Empty,
	X,
	O,
}

function deserBoardSlot(data: number): BoardSlot {
	switch (data) {
		case 0:
			return BoardSlot.Empty;
		case 1:
			return BoardSlot.X;
		case 2:
			return BoardSlot.O;
	}
	return BoardSlot.Empty;
}

class RunningState {
	board: BoardSlot[][];
	playerX: number;

	constructor(serializedState: ArrayBufferLike) {
		const data = new DataView(serializedState);
		this.playerX = data.getUint32(0);
		this.board = [];
		for (let i = 0; i < 9; i++) {
			const y = Math.floor(i / 3);
			if (i % 3 == 0) this.board[y] = [];
			this.board[y][i % 3] = deserBoardSlot(data.getInt8(i + 1));
		}
	}
}

function draw(canvas: HTMLCanvasElement) {
	const parent = canvas.parentElement!;
	const size =
		(canvas.width =
		canvas.height =
			Math.min(parent.clientWidth, parent.clientHeight) * 0.95);
	const ctx = canvas.getContext("2d")!;
	const cellSize = size / 3;

	const lineWidthPerc = 0.02;
	ctx.lineWidth = size * lineWidthPerc;
	ctx.lineCap = "round";
	ctx.beginPath();
	for (let i = 1; i < 3; i++) {
		ctx.moveTo((size * lineWidthPerc) / 2, i * cellSize);
		ctx.lineTo(size * (1 - lineWidthPerc / 2), i * cellSize);
		ctx.moveTo(i * cellSize, (size * lineWidthPerc) / 2);
		ctx.lineTo(i * cellSize, size * (1 - lineWidthPerc / 2));
	}
	ctx.stroke();
}

export default function TicTacToe() {
	const gameState = useContext(GameContext)!;
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { id } = useParams();

	useEffect(() => {
		const canvas = canvasRef.current!;
		function redraw() {
			draw(canvas);
		}
		redraw();
		window.addEventListener("resize", redraw);
		return () => window.removeEventListener("resize", redraw);
	});

	return <canvas ref={canvasRef} css={{ backgroundColor: "white" }} />;
}
