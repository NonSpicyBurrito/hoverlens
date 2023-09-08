export const debounce = <T extends (...args: never[]) => unknown>(
    fn: T,
    getMs: () => number
) => {
    let timer: NodeJS.Timeout

    return (...args: Parameters<T>) => {
        clearTimeout(timer)

        const ms = getMs()
        if (ms > 0) {
            timer = setTimeout(() => fn(...args), getMs())
        } else {
            fn(...args)
        }
    }
}
