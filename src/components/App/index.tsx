


import { lazy, Suspense, useEffect, useState, type FC } from 'react';
import Loading from '@/components/Loading';
import { initInitData } from '@telegram-apps/sdk';

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
