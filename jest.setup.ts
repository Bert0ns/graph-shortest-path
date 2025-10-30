import '@testing-library/jest-dom'

// To solve act() error in tests where sub-dependencies still import react-dom/test-utils's act (deprecated/throws in React 19)
// Create a mock for 'react-dom/test-utils' that delegates act to React.act.
jest.mock('react-dom/test-utils', () => {
    // keep all original exports
    const original = jest.requireActual('react-dom/test-utils')
    return {
        ...original,
        act: (callback: () => unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require('react').act(callback)
        },
    }
})
