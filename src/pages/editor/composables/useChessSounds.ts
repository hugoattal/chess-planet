import type { Move } from "chess.js";

import captureFx from "@/pages/editor/assets/fx/capture.ogg";
import moveCheckFx from "@/pages/editor/assets/fx/move-check.ogg";
import moveSelfFx from "@/pages/editor/assets/fx/move-self.ogg";
import promoteFx from "@/pages/editor/assets/fx/promote.ogg";

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
