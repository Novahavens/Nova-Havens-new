import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

// Nova Havens is a dark-first experience. The shared design-system stylesheet
// keeps its accessible light counterpart as the default and exposes the
// source-faithful palette through the standard dark mode class.
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(<App />);
