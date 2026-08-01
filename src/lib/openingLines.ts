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

export function lineMatchesHistory(line: Array<Move>, history: Array<Move>): boolean {
    return history.every((move, index) => movesMatch(line[index], move));
}

export function getSuggestedArrows(lines: Array<Array<Move>>, moveIndex: number): Array<TBoardArrow> {
    const arrows = new Map<string, TBoardArrow>();

    for (const line of lines) {
        const move = line[moveIndex];

        if (move) {
            arrows.set(`${ move.from }${ move.to }`, { from: move.from, to: move.to });
        }
    }

    return [...arrows.values()];
}

function getMoveKey(move: Move): string {
    return `${ move.from }${ move.to }${ move.promotion ?? "" }`;
}
