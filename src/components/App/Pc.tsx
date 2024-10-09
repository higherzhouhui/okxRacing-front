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
import { getSystemConfigReq, h5PcLoginReq } from '@/api/common';
import { setSystemAction, setUserInfoAction } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import Loading from '../Loading';
import { Toast } from 'antd-mobile';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

const PcApp: FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const eventBus = EventBus.getInstance()
  const [isShowCongrates, setShowCongrates] = useState(false)
  const [showTime, setShowTime] = useState(1500)
  const [isShowBack, setIsShowBack] = useState(false)
  const { isConnected, isLocking } = useConnectWallet()
  const initApp = async () => {
    localStorage.setItem('h5PcRoot', '1')
    const sysInfo = await getSystemConfigReq()
    if (sysInfo.code == 0) {
      dispatch(setSystemAction(sysInfo.data))
    }
    const authorization = localStorage.getItem('authorization')
    const walletInfo = localStorage.getItem('walletInfo')
    const connectedWallet = localStorage.getItem('connectedWallet')
    if (authorization && walletInfo && connectedWallet != "PortkeyDiscover") {
      setLoading(true)
      const res = await h5PcLoginReq(JSON.parse(walletInfo))
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data))
        localStorage.setItem('authorization', res.data.token)
        navigate('/')
        return
        const today = moment().utc().format('MM-DD')
        if (!res.data.check_date || (res.data.check_date && res.data.check_date != today)) {
          navigate('/checkIn')
        } else {
          navigate('/')
        }
      } else {
        Toast.show({
          content: res.msg,
          position: 'center'
        })
        navigate('/wallet')
      }
      setLoading(false)
    } else {
      if (!isConnected && !isLocking) {
        navigate('/wallet')
      }
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
    const onBack = (flag: boolean) => {
      setIsShowBack(flag)
    }
    eventBus.addListener('showCongrates', onMessage)
    eventBus.addListener('showBack', onBack)
    eventBus.addListener('loading', onLoading)
    // 获取邀请参数
    try {
      const url = new URL(location.href);
      const params = new URLSearchParams(url.search.slice(1)); // 移除开头的'?'字符
      const startParam = params.get('startParam')
      if (startParam) {
        localStorage.setItem('startParam', startParam)
      } else {
        localStorage.removeItem('startParam')
      }
    } catch (error) {
      console.error(error)
    }

  }, [])


  return (
    <div className='layout maxWidth' id='layout'>
      {
        isShowBack ? <header onClick={() => navigate(-1)}>
          <svg className='backBtn' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2332" width="24" height="24"><path d="M395.21518 513.604544l323.135538-312.373427c19.052938-18.416442 19.052938-48.273447 0-66.660212-19.053961-18.416442-49.910737-18.416442-68.964698 0L291.75176 480.290811c-19.052938 18.416442-19.052938 48.273447 0 66.660212l357.633237 345.688183c9.525957 9.207709 22.01234 13.796214 34.497699 13.796214 12.485359 0 24.971741-4.588505 34.466999-13.82896 19.052938-18.416442 19.052938-48.242747 0-66.660212L395.21518 513.604544z" fill="#ffffff" p-id="2333"></path></svg>
        </header> : <div></div>
      }
      <div className='content'>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </div>
      <Congrates visible={isShowCongrates} time={showTime} callBack={() => setShowCongrates(false)} />
      {
        loading ? <Loading /> : <div></div>
      }
      <Footer isH5PcRoot />
    </div>
  );
};

export default PcApp