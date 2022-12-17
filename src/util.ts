import { readFile } from "fs/promises";

export const cache = <F extends (...args: any[]) => any>(fn: F, time: number) => {
    let lastCall = 0;
    let lastResult: ReturnType<F>;
    return (...args: Parameters<F>) => {
        const now = Date.now();
        if (now - lastCall > time) {
            lastCall = now;
            lastResult = fn(...args);
        }
        return lastResult;
    };
};

export const base64Image = (filepath: string) =>
    readFile(filepath)
        .then(buf => buf.toString("base64"))
        .then(
            base64 =>
                `data:image/${
                    filepath.split(".").at(-1)?.toLocaleLowerCase() || "webp"
                };base64,${base64}`
        );
