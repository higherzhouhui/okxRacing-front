import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './global.scss';
import '@/mockEnv';


ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

