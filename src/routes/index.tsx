import { createFileRoute } from '@tanstack/react-router'
import App from '../App.tsx';

const Index = () => (
  <App />
);

export const Route = createFileRoute('/')({
  component: Index,
});