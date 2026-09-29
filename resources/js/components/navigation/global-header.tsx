import {useCallback, useEffect, useRef, useState} from "react";
import {CinematicHeader} from "@/features/home/cinematic-header";
import {cinematicMedia} from "@/features/home/media";
import {useAmbientAudio} from "@/features/home/use-ambient-audio";
import {useHomeLanguage} from "@/features/home/use-home-language";

export function GlobalHeader() {
    const [language, setLanguage] = useHomeLanguage();
    const [sound, setSound] = useState(false);
    const [hidden, setHidden] = useState(false);
    const ambient = useRef<HTMLAudioElement>(null);
    const back = useRef<HTMLButtonElement>(null);
    const soundError = useCallback(() => setSound(false), []);

    useEffect(() => {
        const sync = () => setHidden(document.hidden);
        sync();
        document.addEventListener("visibilitychange", sync);
        return () => document.removeEventListener("visibilitychange", sync);
    }, []);

    useAmbientAudio({
        audioRef: ambient,
        enabled: sound,
        hidden,
        ducked: false,
        onPlaybackError: soundError,
    });

    const handleNavigate = (path: string) => {
        window.location.href = path;
    };

    return (
        <>
            <div className="shared-header-space" aria-hidden="true"/>
            <CinematicHeader
                inspect
                showClose={false}
                language={language}
                onLanguageChange={setLanguage}
                sound={sound}
                onToggleSound={() => setSound((value) => !value)}
                onTree={() => handleNavigate("/#tree")}
                onHome={() => handleNavigate("/")}
                onClose={() => handleNavigate("/#tree")}
                backRef={back}
                logo={cinematicMedia.logo}
                logoBlack={cinematicMedia.logoBlack}
            />
            <audio
                ref={ambient}
                src={cinematicMedia.ambient.audio}
                preload="none"
                loop
                onError={soundError}
            />
        </>
    );
}