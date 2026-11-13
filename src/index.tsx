import { React, ReactNative as RN } from "@vendetta/metro/common";
import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import LockScreen from "./LockScreen";
import Settings from "./Settings";
import { isLocked, setLocked, subscribe } from "./state";

// Candidate root-level components; the first one found gets wrapped.
const ROOT_CANDIDATES = ["AppContainer", "RootNavigator", "MainTabsNavigator"];

function Gate({ children }: { children?: any }) {
    const [, rerender] = React.useReducer((n: number) => n + 1, 0);
    React.useEffect(() => subscribe(rerender), []);
    return (
        <>
            {children}
            {isLocked() && <LockScreen />}
        </>
    );
}

const patches: (() => void)[] = [];

export default {
    onLoad() {
        setLocked(storage.lockOnLaunch ?? true);

        let leftAt = 0;
        const sub = RN.AppState.addEventListener("change", (state: string) => {
            if (state === "background") leftAt = Date.now();
            else if (state === "active" && leftAt) {
                if (Date.now() - leftAt >= (storage.timeout ?? 0) * 1000) setLocked(true);
                leftAt = 0;
            }
        });
        patches.push(() => sub.remove());

        for (const name of ROOT_CANDIDATES) {
            const mod = findByName(name, false);
            if (!mod) continue;
            patches.push(after("default", mod, (_: any, res: any) => <Gate>{res}</Gate>));
            break;
        }
    },
    onUnload() {
        patches.forEach(p => p());
        patches.length = 0;
        setLocked(false);
    },
    settings: Settings,
};
