import { createFileRoute } from '@tanstack/react-router'
import App from '../App.tsx';

const Index = () => (
  <div className="flex flex-col h-screen justify-center items-center">
    <App />
  </div>
);

export const Route = createFileRoute('/')({
  component: Index,
});