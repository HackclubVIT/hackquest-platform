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
