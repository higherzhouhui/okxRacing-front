import { lazy, Suspense, useEffect, useState, type FC } from 'react';
import { initInitData } from '@telegram-apps/sdk';
import Loading from '../Loading';

const TgApp = lazy(() => import('./Tg'))
const PcApp = lazy(() => import('./Pc'))

export const App: FC = () => {
  const [isPc, setPc] = useState(false)
  useEffect(() => {
    const initData = initInitData() as any;
    if (initData && initData.user && initData.user.lastName == 'isMockUser_258218') {
      setPc(true)
    }
  }, [])
  return (
    <Suspense fallback={<Loading />}>
      {
        isPc ? <PcApp /> : <TgApp />
      }
    </Suspense>
  );
};
