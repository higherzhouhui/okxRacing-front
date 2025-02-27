import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {
  bindViewportCSSVars,
  initInitData,
  initMiniApp,
  initSwipeBehavior,
  initViewport,
  on,
  postEvent,
  retrieveLaunchParams
} from '@telegram-apps/sdk';


import { routes } from '@/navigation/routes';
import Footer from '@/components/Footer';
import Congrates from '@/components/Congrates';
import EventBus from '@/utils/eventBus';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useState } from 'react';
import { getSystemConfigReq } from '@/api/common';
import { setSystemAction } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import Loading from '../Loading';
import { Toast } from "antd-mobile";
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';


const TgApp: FC = () => {
  const [viewport] = initViewport();
  const [miniApp] = initMiniApp()
  const launchParams = retrieveLaunchParams()
  const { isConnected } = useConnectWallet();
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const eventBus = EventBus.getInstance()
  const [isShowCongrates, setShowCongrates] = useState(false)
  const [showTime, setShowTime] = useState(1500)
  const initApp = async () => {
    if (!isConnected) {
      navigate('/wallet')
    }
    localStorage.removeItem('h5PcRoot')
    const initData = initInitData() as any;
    if (initData && initData.user && initData.user.id) {
      setLoading(true)
      const [sysInfo] = await Promise.all([getSystemConfigReq()])
      if (sysInfo.code == 0) {
        dispatch(setSystemAction(sysInfo.data))
        localStorage.setItem('game_time', sysInfo?.data?.game_time)
      }
      setLoading(false)
    } else {
      Toast.show({
        content: 'Network abnormality',
        position: 'center',
      })
    }

  }
  const expandViewPort = async () => {
    const vp = await viewport;
    if (!vp.isExpanded) {
      vp.expand(); // will expand the Mini App, if it's not
    }
    bindViewportCSSVars(vp);
  }

  const disSwipe = () => {
    try {
      let version: any = launchParams.version
      version = parseFloat(version)
      console.log('current Version:', version)
      if (version > 7.7) {
        const [swipeBehavior] = initSwipeBehavior();
        swipeBehavior.disableVerticalSwipe();
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    initApp()
    disSwipe()
    const onMessage = ({ visible, time }: { visible: boolean, time?: number }) => {
      setShowCongrates(visible)
      setShowTime(time || 1500)
    }
    const onLoading = (flag: boolean) => {
      setLoading(flag)
    }
    eventBus.addListener('showCongrates', onMessage)
    eventBus.addListener('loading', onLoading)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      on('back_button_pressed', () => {
        navigate(-1)
      })
    }, 1500);
    postEvent('web_app_set_header_color', { color: '#000000' });
    postEvent('web_app_setup_main_button', { color: '#000000' });
    postEvent('web_app_set_background_color', { color: '#000000' });
    expandViewPort()
  }, [])
  return (
    <AppRoot
      appearance={miniApp.isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(launchParams.platform) ? 'ios' : 'base'}
    >
      <div className='layout' id='layout'>
        <div className='content'>
          <Routes>
            {routes.map((route) => <Route key={route.path} {...route} />)}
            <Route path='*' element={<Navigate to='/' />} />
          </Routes>
        </div>
        <Footer />
        <Congrates visible={isShowCongrates} time={showTime} callBack={() => setShowCongrates(false)} />
        {
          loading ? <Loading /> : <div></div>
        }
      </div>
    </AppRoot >
  );
};

export default TgApp