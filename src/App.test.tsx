import {describe, expect, test, vi} from 'vitest';
import { render, screen} from '@testing-library/react';
import App from './App';

// Mock Firebase modules
vi.mock('./utilities/firebase', () => ({
  useAuthState: () => ({
    user: null,
    isAuthenticated: false,
    isInitialLoading: false,
  }),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  useSightings: () => [[], false, undefined],
  addSighting: vi.fn(),
  corroborateSighting: vi.fn(),
}));

describe('App component tests', () => {
    
  test("App renders with map instruction text", () => {
    render(<App />);
    expect(screen.getByText('Click on the map to add a pin for an ICE sighting.')).toBeDefined();
  });
});