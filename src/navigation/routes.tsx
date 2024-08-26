import type { ComponentType, JSX } from 'react';

import HomePage from '@/pages/Home';
import GamePage from '@/pages/Game';
import TaskPage from '@/pages/Task';
import FrensPage from '@/pages/Frens';
import WalletPage from '@/pages/Wallet';
import AssetsPage from '@/components/Assets';
import LeaderBoardPage from '@/pages/LeaderBoard';
import FrensDetailPage from '@/pages/Frens/Detail';
import CheckInlPage from '@/pages/CheckIn';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}


export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/game', Component: GamePage },
  { path: '/task', Component: TaskPage },
  { path: '/frens', Component: FrensPage },
  { path: '/leaderboard', Component: LeaderBoardPage },
  { path: '/wallet', Component: WalletPage },
  { path: '/frens-detail', Component: FrensDetailPage },
  { path: '/assets', Component: AssetsPage },
  { path: '/checkIn', Component: CheckInlPage },
];
