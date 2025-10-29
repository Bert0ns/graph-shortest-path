import '@testing-library/jest-dom'

// Suppress the ReactDOMTestUtils.act deprecation warning
// This is a known issue with React 19 and will be resolved in future testing library updates
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('ReactDOMTestUtils.act')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
