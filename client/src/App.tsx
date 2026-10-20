import { useEffect } from 'react';

import { bundledContent } from './content';
import { kstDateKey } from './lib/date';
import { navigate, useRoute } from './lib/router';
import { HomeScreen } from './screens/HomeScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { SignScreen } from './screens/SignScreen';

export default function App() {
  const route = useRoute();
  const today = kstDateKey();
  const content = bundledContent;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  switch (route.name) {
    case 'home':
      return <HomeScreen content={content} today={today} onOpenSign={(sign) => navigate({ name: 'sign', sign })} />;
    case 'sign':
      return <SignScreen content={content} today={today} sign={route.sign} />;
    case 'find':
      return <PlaceholderScreen title="내 별자리 찾기" />;
    case 'mine':
      return <PlaceholderScreen title="내 별자리" />;
    case 'match':
      return <PlaceholderScreen title="별자리 궁합" />;
    case 'settings':
      return <PlaceholderScreen title="설정" />;
  }
}
