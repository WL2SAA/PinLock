(function () {
  const { React, ReactNative: RN } = vendetta.metro.common;
  const { findByName } = vendetta.metro;
  const { after } = vendetta.patcher;
  const { storage } = vendetta.plugin;
  const { semanticColors } = vendetta.ui;
  const { getAssetIDByName } = vendetta.ui.assets;
  const { Forms } = vendetta.ui.components;
  const { showToast } = vendetta.ui.toasts;
  const { useProxy } = vendetta.storage;
  const { FormSection, FormRow, FormInput, FormSwitchRow, FormDivider } = Forms;
  const h = React.createElement;

  const listeners = new Set();
  let locked = true;
  const isLocked = () => locked && !!storage.hash;
  const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
  function setLocked(v) { locked = v; listeners.forEach((fn) => fn()); }

  function cyrb53(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
  function setPin(pin) { storage.salt = Math.random().toString(36).slice(2); storage.hash = cyrb53(storage.salt + pin); }
  function clearPin() { delete storage.hash; delete storage.salt; }
  const checkPin = (pin) => cyrb53(storage.salt + pin) === storage.hash;

  const KEYS = ["1","2","3","4","5","6","7","8","9","","0","\u232B"];
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 30000;

  function LockScreen() {
    const [pin, setPinValue] = React.useState("");
    const [error, setError] = React.useState("");
    const [, tick] = React.useReducer((n) => n + 1, 0);
    const len = storage.pinLength || 4;
    const remaining = Math.max(0, (storage.lockedUntil || 0) - Date.now());
    React.useEffect(() => { if (!remaining) return; const t = setTimeout(tick, 1000); return () => clearTimeout(t); });
    const submit = (value) => {
      if (checkPin(value)) { storage.attempts = 0; setLocked(false); return; }
      storage.attempts = (storage.attempts || 0) + 1;
      if (storage.attempts >= MAX_ATTEMPTS) { storage.attempts = 0; storage.lockedUntil = Date.now() + LOCKOUT_MS; }
      setError("Wrong PIN"); setPinValue(""); RN.Vibration.vibrate(150);
    };
    const press = (k) => {
      if (remaining || !k) return;
      setError("");
      if (k === "\u232B") return setPinValue((p) => p.slice(0, -1));
      const next = (pin + k).slice(0, len);
      setPinValue(next);
      if (next.length === len) submit(next);
    };
    const bg = semanticColors.BACKGROUND_PRIMARY;
    const text = semanticColors.TEXT_NORMAL;
    return h(RN.View, { style: [RN.StyleSheet.absoluteFill, { backgroundColor: bg, zIndex: 9999, elevation: 9999, alignItems: "center", justifyContent: "center" }] },
      h(RN.Image, { source: getAssetIDByName("ic_lock"), style: { width: 40, height: 40, tintColor: text, marginBottom: 16 } }),
      h(RN.Text, { style: { color: text, fontSize: 18, fontWeight: "600", marginBottom: 20 } }, remaining ? "Try again in " + Math.ceil(remaining / 1000) + "s" : "Enter PIN"),
      h(RN.View, { style: { flexDirection: "row", marginBottom: 12 } },
        Array.from({ length: len }).map((_, i) => h(RN.View, { key: i, style: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 8, borderWidth: 1.5, borderColor: text, backgroundColor: i < pin.length ? text : "transparent" } }))),
      h(RN.Text, { style: { color: "#ed4245", height: 20, marginBottom: 16 } }, error),
      h(RN.View, { style: { width: 270, flexDirection: "row", flexWrap: "wrap" } },
        KEYS.map((k, i) => h(RN.Pressable, { key: i, onPress: () => press(k), style: { width: 90, height: 78, alignItems: "center", justifyContent: "center" } },
          h(RN.Text, { style: { color: text, fontSize: 28 } }, k)))));
  }

  const TIMEOUTS = [{ label: "Immediately", value: 0 }, { label: "30 seconds", value: 30 }, { label: "1 minute", value: 60 }, { label: "5 minutes", value: 300 }];

  function Settings() {
    useProxy(storage);
    const [pin, setPinInput] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const save = () => {
      if (!/^\d{4,6}$/.test(pin)) return showToast("PIN must be 4-6 digits");
      if (pin !== confirm) return showToast("PINs don't match");
      storage.pinLength = pin.length; setPin(pin); setPinInput(""); setConfirm(""); showToast("PIN saved");
    };
    return h(RN.ScrollView, null,
      h(FormSection, { title: storage.hash ? "Change PIN" : "Set PIN" },
        h(FormInput, { title: "PIN (4-6 digits)", value: pin, onChange: setPinInput, keyboardType: "number-pad", secureTextEntry: true, maxLength: 6 }),
        h(FormInput, { title: "Confirm PIN", value: confirm, onChange: setConfirm, keyboardType: "number-pad", secureTextEntry: true, maxLength: 6 }),
        h(FormRow, { label: "Save PIN", onPress: save }),
        storage.hash && h(FormRow, { label: "Remove PIN", onPress: () => { clearPin(); setLocked(false); showToast("PIN removed"); } })),
      storage.hash && h(FormSection, { title: "Behavior" },
        h(FormSwitchRow, { label: "Lock on app launch", value: storage.lockOnLaunch ?? true, onValueChange: (v) => (storage.lockOnLaunch = v) }),
        h(FormDivider),
        TIMEOUTS.map((t) => h(FormRow, { key: t.value, label: "Relock: " + t.label,
          trailing: (storage.timeout || 0) === t.value ? h(FormRow.Icon, { source: getAssetIDByName("ic_check") }) : undefined,
          onPress: () => (storage.timeout = t.value) })),
        h(FormDivider),
        h(FormRow, { label: "Lock now", onPress: () => setLocked(true) })));
  }

  const ROOT_CANDIDATES = ["AppContainer", "RootNavigator", "MainTabsNavigator"];
  function Gate(props) {
    const [, rerender] = React.useReducer((n) => n + 1, 0);
    React.useEffect(() => subscribe(rerender), []);
    return h(React.Fragment, null, props.children, isLocked() ? h(LockScreen) : null);
  }

  const patches = [];
  return {
    onLoad() {
      setLocked(storage.lockOnLaunch ?? true);
      let leftAt = 0;
      const sub = RN.AppState.addEventListener("change", (state) => {
        if (state === "background") leftAt = Date.now();
        else if (state === "active" && leftAt) {
          if (Date.now() - leftAt >= (storage.timeout || 0) * 1000) setLocked(true);
          leftAt = 0;
        }
      });
      patches.push(() => sub.remove());
      for (const name of ROOT_CANDIDATES) {
        const mod = findByName(name, false);
        if (!mod) continue;
        patches.push(after("default", mod, (_, res) => h(Gate, null, res)));
        break;
      }
    },
    onUnload() { patches.forEach((p) => p()); patches.length = 0; setLocked(false); },
    settings: Settings,
  };
})()
