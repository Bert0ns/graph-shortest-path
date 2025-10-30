import '@testing-library/jest-dom'

// Work around sub-dependencies using react-dom/test-utils's act in React 19.
// We keep using the original act from react-dom/test-utils but silence its deprecation warning
// so that it doesn't fail CI logs. This is more robust than calling React.act directly,
// which may not be available under certain bundling/interop conditions.
jest.mock('react-dom/test-utils', () => {
    const original = jest.requireActual('react-dom/test-utils')

    type ActLike = (cb: () => unknown) => unknown

    const shouldSuppressDeprecation = (args: unknown[]): boolean => {
        const needle = 'ReactDOMTestUtils.act is deprecated'
        return args.some((arg) => {
            if (typeof arg === 'string') return arg.includes(needle)
            if (arg instanceof Error) return arg.message.includes(needle)
            try {
                const s = String(arg)
                if (s && s !== '[object Object]' && s.includes(needle)) return true
                const j = JSON.stringify(arg)
                return j.includes(needle)
            } catch {
                return false
            }
        })
    }

    return {
        ...original,
        act: (callback: () => unknown) => {
            const prevError: (...data: unknown[]) => void = (console.error as unknown as (...data: unknown[]) => void)
            console.error = (...args: unknown[]) => {
                if (shouldSuppressDeprecation(args)) return
                prevError(...args)
            }
            try {
                return (original.act as unknown as ActLike)(callback)
            } finally {
                console.error = prevError as unknown as typeof console.error
            }
        },
    }
})
