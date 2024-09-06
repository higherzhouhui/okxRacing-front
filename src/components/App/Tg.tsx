import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {
  bindViewportCSSVars,
  initBackButton,
  initInitData,
  initMiniApp,
  initSwipeBehavior,
  initViewport,
  retrieveLaunchParams
} from '@telegram-apps/sdk';


import { routes } from '@/navigation/routes';
import Footer from '@/components/Footer';
import Congrates from '@/components/Congrates';
import EventBus from '@/utils/eventBus';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useState } from 'react';
import { getSystemConfigReq, loginReq } from '@/api/common';
import { setSystemAction } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import Loading from '../Loading';
import { Toast } from "antd-mobile";


const TgApp: FC = () => {
  const [backButton] = initBackButton()
  const [swipeBehavior] = initSwipeBehavior();
  const [viewport] = initViewport();
  const [miniApp] = initMiniApp()
  const launchParams = retrieveLaunchParams()

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const eventBus = EventBus.getInstance()
  const [isShowCongrates, setShowCongrates] = useState(false)
  const [showTime, setShowTime] = useState(1500)
  const initApp = async () => {
    localStorage.removeItem('h5PcRoot')
    const initData = initInitData() as any;
    if (initData && initData.user && initData.user.id) {
      const user = initData.initData.user
      const data = { ...initData.initData, ...user }
      setLoading(true)
      const [res, sysInfo] = await Promise.all([loginReq(data), getSystemConfigReq()])
      if (res.code == 0) {
        // dispatch(setUserInfoAction(res.data))
        localStorage.setItem('authorization', res.data.token)
        navigate('/home')
        // const today = moment().utc().format('MM-DD')
        // if (!res.data.check_date || (res.data.check_date && res.data.check_date != today)) {
        //   navigate('/checkIn')
        // } else {
        //   navigate('/home')
        // }
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
  const expandViewPort = async () => {
    const vp = await viewport;
    if (!vp.isExpanded) {
      vp.expand(); // will expand the Mini App, if it's not
    }
    bindViewportCSSVars(vp);
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
    backButton.on('click', () => {
      navigate(-1)
    })
    swipeBehavior.disableVerticalSwipe();
    // const tp = initThemeParams();
    // bindThemeParamsCSSVars(tp);
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
          loading ? <Loading /> : null
        }
      </div>
    </AppRoot >
  );
};

export default TgApp