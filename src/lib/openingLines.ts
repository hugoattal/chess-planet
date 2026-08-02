import type { Move } from "chess.js";
import { Chess } from "chess.js";

import type { TBoardArrow } from "@/pages/editor/lib/boardArrows.ts";

export function parseOpeningLines(lines: Array<string>): Array<Array<Move>> {
    return lines.flatMap((line) => {
        const game = new Chess();

        try {
            game.loadPgn(line);
            return [game.history({ verbose: true })];
        }
        catch {
            return [];
        }
    }).filter((moves) => moves.length > 0);
}

export function movesMatch(expectedMove: Move | undefined, playedMove: Move): boolean {
    return Boolean(expectedMove && getMoveKey(expectedMove) === getMoveKey(playedMove));
}

export function getMatchingLines(lines: Array<Array<Move>>, history: Array<Move>): Array<Array<Move>> {
    if (!history.length) {
        return lines;
    }

    const position = getPositionKey(history.at(-1)!.after);

    return lines.filter((line) => line.some((move) => (
        getPositionKey(move.before) === position || getPositionKey(move.after) === position
    )));
}

export function getContinuingMoves(lines: Array<Array<Move>>, history: Array<Move>): Array<Move> {
    if (!history.length) {
        return lines.map((line) => line[0]);
    }

    const position = getPositionKey(history.at(-1)!.after);

    return lines.flatMap((line) => line.filter((move) => getPositionKey(move.before) === position));
}

export function getSuggestedArrows(lines: Array<Array<Move>>, history: Array<Move>): Array<TBoardArrow> {
    const arrows = new Map<string, TBoardArrow>();

    for (const move of getContinuingMoves(lines, history)) {
        arrows.set(`${ move.from }${ move.to }`, { from: move.from, to: move.to });
    }

    return [...arrows.values()];
}

function getPositionKey(fen: string): string {
    return fen.split(" ", 4).join(" ");
}

function getMoveKey(move: Move): string {
    return `${ move.from }${ move.to }${ move.promotion ?? "" }`;
}
