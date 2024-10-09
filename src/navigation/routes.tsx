/* eslint-disable react-refresh/only-export-components */
import { lazy, type ComponentType, type JSX } from 'react';

const  HomePage= lazy(() => import('@/pages/Home'))
const  TaskPage= lazy(() => import('@/pages/Task'))
const  FrensPage= lazy(() => import('@/pages/Frens'))
const  WalletPage= lazy(() => import('@/pages/Wallet'))
const  AssetsPage= lazy(() => import('@/components/Assets'))
const  LeaderBoardPage= lazy(() => import('@/pages/LeaderBoard'))
const  CheckInlPage= lazy(() => import('@/pages/Frens/Detail'))
const  TermsPage= lazy(() => import('@/pages/Terms'))
const  LevelPage= lazy(() => import('@/pages/Level'))
const  FrensDetailPage= lazy(() => import('@/pages/Frens/Detail'))
const IndexPage = lazy(() => import('@/pages/Index'))

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/index', Component: IndexPage },
  { path: '/task', Component: TaskPage },
  { path: '/frens', Component: FrensPage },
  { path: '/leaderboard', Component: LeaderBoardPage },
  { path: '/wallet', Component: WalletPage },
  { path: '/frens-detail', Component: FrensDetailPage },
  { path: '/assets', Component: AssetsPage },
  { path: '/checkIn', Component: CheckInlPage },
  { path: '/terms', Component: TermsPage },
  { path: '/level', Component: LevelPage },
];
