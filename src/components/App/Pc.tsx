import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  useMiniApp,
  useThemeParams,
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
import { type FC, useEffect, useState } from 'react';
import { getSystemConfigReq, h5PcLoginReq, loginReq } from '@/api/common';
import { setSystemAction, setUserInfoAction } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import Loading from '../Loading';


const PcApp: FC = () => {
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  const eventBus = EventBus.getInstance()
  const [isShowCongrates, setShowCongrates] = useState(false)
  const [showTime, setShowTime] = useState(1500)
  const [isShowBack, setIsShowBack] = useState(false)
  const initApp = async () => {
    try {
      localStorage.setItem('h5PcRoot', '1')
      const authorization = localStorage.getItem('authorization')
      const walletInfo = localStorage.getItem('walletInfo')
      const h5PcRoot = true
      if (authorization && h5PcRoot && walletInfo) {
        setLoading(true)
        const [res, sysInfo] = await Promise.all([h5PcLoginReq(JSON.parse(walletInfo)), getSystemConfigReq()])
        if (sysInfo.code == 0) {
          dispatch(setSystemAction(sysInfo.data))
        }
        if (res.code == 0) {
          dispatch(setUserInfoAction(res.data))
          localStorage.setItem('authorization', res.data.user_id)
          if (res.data.check_date) {
            const today = moment().utc().format('MM-DD')
            if (res.data.check_date != today) {
              navigate('/checkIn')
            }
          } else {
            navigate('/checkIn')
          }
        }
        setLoading(false)
      } else {
        navigate('/wallet')
      }
    } catch (error) {
      navigate('/wallet')
    }
  }
  useEffect(() => {
    localStorage.setItem('h5PcRoot', '1')
    // initApp()
    const onMessage = ({ visible, time }: { visible: boolean, time?: number }) => {
      setShowCongrates(visible)
      setShowTime(time || 1500)
    }
    const onLoading = (flag: boolean) => {
      setLoading(flag)
    }
    const onBack = (flag: boolean) => {
      setIsShowBack(flag)
    }
    eventBus.addListener('showCongrates', onMessage)
    eventBus.addListener('showBack', onBack)
    eventBus.addListener('loading', onLoading)
  }, [])


  return (
    <div className='layout maxWidth pcLayout' id='layout'>
      <Footer isH5PcRoot />
      {
        isShowBack ? <header onClick={() => navigate(-1)}>
          <svg className='backBtn' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2332" width="24" height="24"><path d="M395.21518 513.604544l323.135538-312.373427c19.052938-18.416442 19.052938-48.273447 0-66.660212-19.053961-18.416442-49.910737-18.416442-68.964698 0L291.75176 480.290811c-19.052938 18.416442-19.052938 48.273447 0 66.660212l357.633237 345.688183c9.525957 9.207709 22.01234 13.796214 34.497699 13.796214 12.485359 0 24.971741-4.588505 34.466999-13.82896 19.052938-18.416442 19.052938-48.242747 0-66.660212L395.21518 513.604544z" fill="#ffffff" p-id="2333"></path></svg>
        </header> : null
      }
      <div className='content'>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
        <div className='bot' style={{ height: '20px' }} />
      </div>
      <Congrates visible={isShowCongrates} time={showTime} callBack={() => setShowCongrates(false)} />
      {
        loading ? <Loading /> : null
      }
    </div>
  );
};

export default PcApp