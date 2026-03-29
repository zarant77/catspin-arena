import ReactDOM from 'react-dom/client';
import { preloadAllAssets } from '@catspin/assets';
import App from './App';
import { StoreProvider } from './state/storeContext';
import { startAnimatedPawFavicon } from './components/common/animatedFavicon';

startAnimatedPawFavicon();

async function bootstrap(): Promise<void> {
  const rootElement = document.getElementById('root');

  if (rootElement === null) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <StoreProvider>
      <App />
    </StoreProvider>,
  );

  await preloadAllAssets();

  window.dispatchEvent(new Event('catspin:assets-ready'));
}

void bootstrap();
