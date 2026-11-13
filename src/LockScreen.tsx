import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { checkPin, setLocked } from "./state";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

export default function LockScreen() {
    const [pin, setPinValue] = React.useState("");
    const [error, setError] = React.useState("");
    const [, tick] = React.useReducer(n => n + 1, 0);

    const len = storage.pinLength ?? 4;
    const remaining = Math.max(0, (storage.lockedUntil ?? 0) - Date.now());

    React.useEffect(() => {
        if (!remaining) return;
        const t = setTimeout(tick, 1000);
        return () => clearTimeout(t);
    });

    const submit = (value: string) => {
        if (checkPin(value)) {
            storage.attempts = 0;
            setLocked(false);
            return;
        }
        storage.attempts = (storage.attempts ?? 0) + 1;
        if (storage.attempts >= MAX_ATTEMPTS) {
            storage.attempts = 0;
            storage.lockedUntil = Date.now() + LOCKOUT_MS;
        }
        setError("Wrong PIN");
        setPinValue("");
        RN.Vibration.vibrate(150);
    };

    const press = (k: string) => {
        if (remaining || !k) return;
        setError("");
        if (k === "⌫") return setPinValue(p => p.slice(0, -1));
        const next = (pin + k).slice(0, len);
        setPinValue(next);
        if (next.length === len) submit(next);
    };

    const bg = semanticColors.BACKGROUND_PRIMARY;
    const text = semanticColors.TEXT_NORMAL;

    return (
        <RN.View style={[RN.StyleSheet.absoluteFill, { backgroundColor: bg, zIndex: 9999, elevation: 9999, alignItems: "center", justifyContent: "center" }]}>
            <RN.Image source={getAssetIDByName("ic_lock")} style={{ width: 40, height: 40, tintColor: text, marginBottom: 16 }} />
            <RN.Text style={{ color: text, fontSize: 18, fontWeight: "600", marginBottom: 20 }}>
                {remaining ? `Try again in ${Math.ceil(remaining / 1000)}s` : "Enter PIN"}
            </RN.Text>

            <RN.View style={{ flexDirection: "row", marginBottom: 12 }}>
                {Array.from({ length: len }).map((_, i) => (
                    <RN.View key={i} style={{
                        width: 14, height: 14, borderRadius: 7, marginHorizontal: 8,
                        borderWidth: 1.5, borderColor: text,
                        backgroundColor: i < pin.length ? text : "transparent",
                    }} />
                ))}
            </RN.View>

            <RN.Text style={{ color: "#ed4245", height: 20, marginBottom: 16 }}>{error}</RN.Text>

            <RN.View style={{ width: 270, flexDirection: "row", flexWrap: "wrap" }}>
                {KEYS.map((k, i) => (
                    <RN.Pressable key={i} onPress={() => press(k)} style={{ width: 90, height: 78, alignItems: "center", justifyContent: "center" }}>
                        <RN.Text style={{ color: text, fontSize: 28 }}>{k}</RN.Text>
                    </RN.Pressable>
                ))}
            </RN.View>
        </RN.View>
    );
}                                                                                                                                                                                                                                                                                                                                                                                             backgroundColor: i < pin.length ? text : "transparent",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ))}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </RN.View>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <RN.Text style={{ color: "#ed4245", height: 20, marginBottom: 16 }}>{error}</RN.Text>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <RN.View style={{ width: 270, flexDirection: "row", flexWrap: "wrap" }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        {KEYS.map((k, i) => (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <RN.Pressable key={i} onPress={() => press(k)} style={{ width: 90, height: 78, alignItems: "center", justifyContent: "center" }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <RN.Text style={{ color: text, fontSize: 28 }}>{k}</RN.Text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </RN.Pressable>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ))}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </RN.View>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </RN.View>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                                             
