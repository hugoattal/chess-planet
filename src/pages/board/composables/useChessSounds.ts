import type { Move } from "chess.js";

import captureFx from "@/pages/board/assets/fx/capture.mp3";
import moveCheckFx from "@/pages/board/assets/fx/move-check.mp3";
import moveSelfFx from "@/pages/board/assets/fx/move-self.mp3";
import promoteFx from "@/pages/board/assets/fx/promote.mp3";

const sounds = {
    capture: new Audio(captureFx),
    check: new Audio(moveCheckFx),
    move: new Audio(moveSelfFx),
    promote: new Audio(promoteFx)
};

export function useChessSounds() {
    function playMoveSound(move: Move, isCheck: boolean) {
        if (move.promotion) {
            playSound(sounds.promote);
            return;
        }

        if (isCheck) {
            playSound(sounds.check);
            return;
        }

        playSound(move.captured ? sounds.capture : sounds.move);
    }

    function playUndoSound() {
        playSound(sounds.move);
    }

    function playSound(sound: HTMLAudioElement) {
        sound.currentTime = 0;
        void sound.play();
    }

    return {
        playMoveSound,
        playUndoSound
    };
}
