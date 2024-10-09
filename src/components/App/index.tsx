import { lazy, Suspense, useEffect, useState, type FC } from 'react';
import { initInitData } from '@telegram-apps/sdk';
import Loading from '../Loading';
import { initializeAnalytics, trackPageView } from '@/utils/analytics';
import { useLocation } from 'react-router-dom';

const TgApp = lazy(() => import('./Tg'))
const PcApp = lazy(() => import('./Pc'))

export const App: FC = () => {
  const [isPc, setPc] = useState(false)
  useEffect(() => {
    const initData = initInitData() as any;
    if (initData && initData.user && initData.user.lastName == 'isMockUser_258218') {
      setPc(true)
    }
    initializeAnalytics()
  }, [])

  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return (
    <Suspense fallback={<Loading />}>
      {
        isPc ? <PcApp /> : <TgApp />
      }
    </Suspense>
  );
};
