import Loading from '@/components/Loading';
import { Toast } from 'antd-mobile';
import { setSystemAction } from '@/redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import { initInitData } from '@telegram-apps/sdk';
import { getSystemConfigReq, loginReq } from '@/api/common';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function IndexPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const initApp = async () => {
    localStorage.setItem('h5PcRoot', '0')
    const initData = initInitData() as any;
    if (initData && initData.user && initData.user.id) {
      const user = initData.initData.user
      const data = { ...initData.initData, ...user }
      const [res, sysInfo] = await Promise.all([loginReq(data), getSystemConfigReq()])
      if (res.code == 0) {
        if (sysInfo.code == 0) {
          dispatch(setSystemAction(sysInfo.data))
        }
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

    } else {
      Toast.show({
        content: 'Network abnormality',
        position: 'center',
      })
    }
  }
  useEffect(() => {
    initApp()
  }, [])
  return <Loading />
}

export default IndexPage;