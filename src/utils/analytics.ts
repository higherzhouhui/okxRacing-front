import ReactGA from 'react-ga';
const id = import.meta.env.GOOGLE_ID

export function initializeAnalytics() {
  ReactGA.initialize(id); // 用您的跟踪 ID 替换 G-XXXXXXXXXX
  console.log('ReactGA is init')
}

export function trackPageView(page: any) {
  ReactGA.pageview(page);
  console.log('pageview is exec')
}
