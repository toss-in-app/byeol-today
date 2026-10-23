import { useEffect } from 'react';

import { bundledContent } from './content';
import { useMine } from './hooks/useMine';
import { kstDateKey } from './lib/date';
import { goBack, navigate, useRoute } from './lib/router';
import { FindScreen } from './screens/FindScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MineScreen } from './screens/MineScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { SignScreen } from './screens/SignScreen';
import type { SignId } from './sky';

export default function App() {
  const route = useRoute();
  const today = kstDateKey();
  const content = bundledContent;
  const mine = useMine();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const openSign = (sign: SignId) => navigate({ name: 'sign', sign });

  switch (route.name) {
    case 'home':
      return (
        <HomeScreen
          content={content}
          today={today}
          mine={mine.items}
          mineReady={mine.ready}
          onOpenSign={openSign}
          onFind={() => navigate({ name: 'find' })}
          onEditMine={() => navigate({ name: 'mine' })}
        />
      );
    case 'sign':
      return <SignScreen content={content} today={today} sign={route.sign} inMine={mine.has(route.sign)} mineCount={mine.items.length} onRegister={mine.add} />;
    case 'find':
      return <FindScreen content={content} mineCount={mine.items.length} onRegister={mine.add} onDone={goBack} />;
    case 'mine':
      return <MineScreen content={content} today={today} items={mine.items} onOpenSign={openSign} onAdd={() => navigate({ name: 'find' })} onRemove={mine.remove} />;
    case 'match':
      return <PlaceholderScreen title="별자리 궁합" />;
    case 'settings':
      return <PlaceholderScreen title="설정" />;
  }
}
