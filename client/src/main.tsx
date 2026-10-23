import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import config from '../apps-in-toss.config.ts';
import App from './App.tsx';
import './index.css';
import { registerSerif } from './lib/fonts';

// 비주얼 '천체도': 차트 글자·카드 제목에만 쓰는 세리프(woff2 번들 동봉, OFL). 본문은 TDS 고딕 그대로
registerSerif();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
);
