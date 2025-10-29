import '@testing-library/jest-dom'
import { act } from 'react';

//To solve act() warning in tests (sub dependencies using react-dom/test-utils act not updated)
// Create mock module 'react-dom/test-utils'
jest.mock('react-dom/test-utils', () => {
    // keep all origina exports
    const original = jest.requireActual('react-dom/test-utils');

    return {
        ...original,
        // overwrite 'act' function
        act: (callback: () => unknown) => {
            return act(callback);
        },
    };
});