import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { clearPin, setPin, setLocked } from "./state";

const { FormSection, FormRow, FormInput, FormSwitchRow, FormDivider } = Forms;

const TIMEOUTS = [
    { label: "Immediately", value: 0 },
    { label: "30 seconds", value: 30 },
    { label: "1 minute", value: 60 },
    { label: "5 minutes", value: 300 },
];

export default function Settings() {
    useProxy(storage);
    const [pin, setPinInput] = React.useState("");
    const [confirm, setConfirm] = React.useState("");

    const save = () => {
        if (!/^\d{4,6}$/.test(pin)) return showToast("PIN must be 4-6 digits");
        if (pin !== confirm) return showToast("PINs don't match");
        storage.pinLength = pin.length;
        setPin(pin);
        setPinInput("");
        setConfirm("");
        showToast("PIN saved");
    };

    return (
        <RN.ScrollView>
            <FormSection title={storage.hash ? "Change PIN" : "Set PIN"}>
                <FormInput title="PIN (4-6 digits)" value={pin} onChange={setPinInput} keyboardType="number-pad" secureTextEntry maxLength={6} />
                <FormInput title="Confirm PIN" value={confirm} onChange={setConfirm} keyboardType="number-pad" secureTextEntry maxLength={6} />
                <FormRow label="Save PIN" onPress={save} />
                {storage.hash && (
                    <FormRow label="Remove PIN" onPress={() => { clearPin(); setLocked(false); showToast("PIN removed"); }} />
                )}
            </FormSection>

            {storage.hash && (
                <FormSection title="Behavior">
                    <FormSwitchRow
                        label="Lock on app launch"
                        value={storage.lockOnLaunch ?? true}
                        onValueChange={(v: boolean) => (storage.lockOnLaunch = v)}
                    />
                    <FormDivider />
                    {TIMEOUTS.map(t => (
                        <FormRow
                            key={t.value}
                            label={`Relock: ${t.label}`}
                            trailing={(storage.timeout ?? 0) === t.value ? <FormRow.Icon source={getAssetIDByName("ic_check")} /> : undefined}
                            onPress={() => (storage.timeout = t.value)}
                        />
                    ))}
                    <FormDivider />
                    <FormRow label="Lock now" onPress={() => setLocked(true)} />
                </FormSection>
            )}
        </RN.ScrollView>
    );
}
