
import eruda from "eruda";
// import '@/trackers'

import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initBackButton,
  initInitData,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';

import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import { routes } from '@/navigation/routes';
import Footer from '@/components/Footer';
import Congrates from '@/components/Congrates';
import EventBus from '@/utils/eventBus';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useMemo, useState } from 'react';
import { getSystemConfigReq, loginReq } from '@/api/common';
import { setSystemAction, setUserInfoAction } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import Loading from '../Loading';
import { Toast } from "antd-mobile";


const TgApp: FC = () => {
  const debug = useLaunchParams().startParam === 'debug';
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const [backButton] = initBackButton()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const manifestUrl = useMemo(() => {
    return new URL('tonconnect-manifest.json', window.location.href).toString();
  }, []);

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    if (!viewport?.isExpanded) {
      viewport?.expand(); // will expand the Mini App, if it's not
    }
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);
  const eventBus = EventBus.getInstance()
  const [isShowCongrates, setShowCongrates] = useState(false)
  const [showTime, setShowTime] = useState(1500)
  const initApp = async () => {
    localStorage.setItem('h5PcRoot', '0')
    const initData = initInitData() as any;
    if (initData && initData.user && initData.user.id) {
      const user = initData.initData.user
      const data = { ...initData.initData, ...user }
      setLoading(true)
      const [res, sysInfo] = await Promise.all([loginReq(data), getSystemConfigReq()])
      if (res.code == 0) {
        // dispatch(setUserInfoAction(res.data))
        localStorage.setItem('authorization', res.data.token)
        const today = moment().utc().format('MM-DD')
        if (!res.data.check_date || (res.data.check_date && res.data.check_date != today)) {
          navigate('/checkIn')
        } else {
          navigate('/home')
        }
      } else {
        Toast.show({
          content: res.msg,
          position: 'center'
        })
      }
      if (sysInfo.code == 0) {
        dispatch(setSystemAction(sysInfo.data))
      }
      setLoading(false)
    } else {
      Toast.show({
        content: 'Network abnormality',
        position: 'center',
      })
    }
  }
  useEffect(() => {
    initApp()
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
    if (debug) {
      eruda.init()
    }
  }, [debug]);

  useEffect(() => {
    backButton.on('click', () => {
      navigate(-1)
    })
  }, [])

  return (
    <AppRoot
      appearance={miniApp.isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
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
          loading ? <Loading /> : null
        }
      </div>
    </AppRoot >
  );
};

export default TgApp