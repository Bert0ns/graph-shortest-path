import '@testing-library/jest-dom'

// Polyfill for React.act in React 19
// React 19 moved act to a different export, causing issues with testing libraries
// This provides the expected global React.act for testing libraries
import { act as reactAct } from 'react';
import * as React from 'react';

// @ts-expect-error - Adding act to React global for testing library compatibility
if (!React.act) {
    // @ts-expect-error - Adding act to React global
    React.act = reactAct;
}
