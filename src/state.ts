import { storage } from "@vendetta/plugin";

const listeners = new Set<() => void>();
let locked = true;

export const isLocked = () => locked && !!storage.hash;
export const subscribe = (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn));

export function setLocked(v: boolean) {
    locked = v;
        listeners.forEach(fn => fn());
        }

        // cyrb53: not cryptographic, fine for a local gate. Salt blocks trivial rainbow lookups.
        function cyrb53(str: string) {
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

                                                        export function setPin(pin: string) {
                                                            storage.salt = Math.random().toString(36).slice(2);
                                                                storage.hash = cyrb53(storage.salt + pin);
                                                                }

                                                                export const clearPin = () => {
                                                                    delete storage.hash;
                                                                        delete storage.salt;
                                                                        };

                                                                        export const checkPin = (pin: string) => cyrb53(storage.salt + pin) === storage.hash;