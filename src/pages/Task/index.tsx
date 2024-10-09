import './index.scss'
import { useEffect, useState } from 'react'
import { taskListReq, handleTakReq } from '@/api/task'
import { initHapticFeedback, initUtils } from '@telegram-apps/sdk'
import { Button, Popup, Skeleton, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import BackTop from '@/components/BackTop'
import { useDispatch, useSelector } from 'react-redux'
import { addgasGameReq } from '@/api/game'
import { setUserInfoAction } from '@/redux/slices/userSlice'
import { useLaunchParams } from '@telegram-apps/sdk-react'

function TaskPage() {
  const hapticFeedback = initHapticFeedback();
  const launchParams = useLaunchParams();
  const utils = initUtils();
  const userInfo = useSelector((state: any) => state.user.info);
  const systemInfo = useSelector((state: any) => state.user.system);
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isShowUnLock, setShowUnlock] = useState(false)
  const [isShowAddGas, setShowAddGas] = useState(false)
  const handleUnLock = () => {
    setShowUnlock(true)
  }
  const handleAddGas = async () => {
    if (userInfo.free_gas) {
      const res = await addgasGameReq()
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data))
        setShowAddGas(false)
        Toast.show({
          content: 'The fuel tank is already full!',
          position: 'top'
        })
      } else {
        Toast.show({
          content: res.msg,
          position: 'top',
        })
      }
    }
  }
  const handleDoTask = async (item: any, index: number, cIndex: number) => {
    if (taskLoading) {
      return
    }
    if (item.status != 'Done') {
      const _list = JSON.parse(JSON.stringify(list))
      setTaskLoading(true)
      _list[index][cIndex].loading = true
      setList(_list)
      const res = await handleTakReq(item)
      if (res.code == 0) {
        setTimeout(() => {
          const _list = JSON.parse(JSON.stringify(list))
          _list[index][cIndex].status = res.data.status
          _list[index][cIndex].loading = false
          setList(_list)
          setTaskLoading(false)
          hapticFeedback.notificationOccurred('success')
        }, 10000);
      } else {
        Toast.show({ content: res.msg, position: 'top' })
        hapticFeedback.notificationOccurred('error')
        const _list = JSON.parse(JSON.stringify(list))
        _list[index][cIndex].loading = false
        setList(_list)
        setTaskLoading(false)
      }
      if (item.status == null) {
        if (localStorage.getItem('h5PcRoot') == '1' || launchParams.platform == 'tdesktop') {
          if (item.linkType == 'self') {
            navigate(item.link)
          } else {
            window.open(item.link)
          }
        } else {
          if (item.linkType.includes('telegram')) {
            utils.openTelegramLink(item.link)
          } else if (item.linkType == 'outside') {
            location.href = item.link
          } else if (item.linkType == 'self') {
            navigate(item.link)
          }
        }
      }
    }
  }

  const groupByType = (arr: any) => {
    return Object.values(
      arr.reduce((acc, item) => {
        const type = item.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {})
    );
  }

  const getImgSrc = (img: string) => {
    if (img.includes('Game')) {
      return 'game'
    }
    if (img.includes('PortKey')) {
      return 'portkey'
    }
    if (img.includes('Aelf')) {
      return 'aelf'
    }
    return 'portkey'
  }


  useEffect(() => {
    setLoading(true)
    taskListReq().then(res => {
      setLoading(false)
      if (res.code == 0) {
        res.data.map(item => {
          item.loading = false
        })
        const nullList = res.data.filter(item => {
          return item.status == null
        })
        const claimList = res.data.filter(item => {
          return item.status == 'Claim'
        })
        const doneList = res.data.filter(item => {
          return item.status == 'Done'
        })
        const _list = [...nullList, ...claimList, ...doneList]
        const list = groupByType(_list)
        setList(list)
      }
    })
  }, [])
  return <div className='task-page fadeIn'>
    <div className='task-title'>
      <div className='ky'>
        <div className='ky-label'>Available points</div>
        <div className='ky-score'>{userInfo?.score?.toLocaleString()}</div>
      </div>
      <div className='right-score'>
        <div className='right-score-item'>
          <div className='rs-label'>Guess the basic integral correctly once</div>
          <div className='rs-code'>
          <img src="/assets/common/score.png" alt="score" />
            {systemInfo?.right_score}</div>
        </div>
        <div className='right-score-item'>
          <div className='rs-label'>Hourly autonomous driving points</div>
          <div className='rs-code'>
            <img src="/assets/common/score.png" alt="score" />
            {systemInfo?.auto_driver}
            </div>
        </div>
      </div>
    </div>

    <div className='update-title'>Upgrade</div>
    <div className='gas-container'>
      <div className='gas-item'>
        <img src='/assets/task/auto.png' className='gas-icon'/>
        <div className='gas-title'>Auto Driver<span>New</span></div>
        <div className='unlock-desc'>unLock</div>
        {
          !userInfo.wallet ? <div className='gas-mask' onClick={() => handleUnLock()}>
          <img src='/assets/task/unlock.png' className='lock-img'/>
          <div className='unlock'>
            UnLock
            <img src='/assets/task/right.png' />
          </div>
        </div> : null
        }
      </div>
      <div className='gas-item' onClick={() => setShowAddGas(true)}>
        <img src='/assets/task/gas.png' className='gas-icon'/>
        <div className='gas-title'>Refill the fuel tank</div>
        <div className='unlock-desc'>
          <img src='/assets/common/score.png' />
          <span>Free</span>
          <span className='lv'><span className='high'>{userInfo?.free_gas}&nbsp;/</span>&nbsp;{systemInfo?.free_gas}</span>
          </div>
      </div>
    </div>
    <div className='update-wrapper'>
      <div className='update-item'></div>
    </div>
    <div className='task-list'>
      {
        loading ? [...Array(5)].map((_, index) => {
          return <Skeleton className='skeleton' animated key={index} />
        }) : null
      }
      {
        list.map((item: any, index) => {
          return <div className='item-wrapper' key={index}>
            <div className='item-wrapper-title'>
              <img src={`/assets/task/${getImgSrc(item[0].type)}.png`} className='logo-pic' />
              {
                item[0].type
              }
            </div>
            {
              item.map((citem: any, cindex: number) => {
                return <div key={cindex} className='task-list-item'>
                  <div className='task-list-left'>
                    <div className='middle'>
                      <div className='middle-name'>{citem.name}</div>
                      <div className='reward'>
                        <span>+{citem?.score?.toLocaleString()}</span>
                        &nbsp;<img src='/assets/common/score.png' alt='tomato' className='unit-img' />
                        &nbsp;Pts
                      </div>
                    </div>
                  </div>
                  <div className='task-list-right'>
                    <Button className={`task-list-right-btn ${citem.status}`} onClick={() => handleDoTask(citem, index, cindex)} loading={citem.loading}>
                      {
                        citem.status || 'Start'
                      }
                    </Button>
                  </div>
                </div>
              })
            }
          </div>
        })
      }
    </div>
    
    <Popup visible={isShowUnLock}
      onMaskClick={() => {
        setShowUnlock(false)
      }}
      bodyStyle={{
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
      className='popup-unlock'>
        <div className='pop-unlock-content maxWidth'>
          <div className='close' onClick={() => setShowUnlock(false)}>
            <img src='/assets/common/close.png' />
          </div>
          <img src="/assets/task/auto.png" alt="auto" className='auto-img'/>
          <div className='new'>New</div>
          <div className='auto-title'>Auto Driver</div>
          <div className='auto-desc'>Bind your Telegram account with portKey and complete identity authentication to unlock autonomous driving. During your offline period, the game will automatically continue and earn points.</div>
          <div className='free'>
            <img src='/assets/common/score.png' />
            <span className='free-title'>Free</span>
            <span className='lv'>Lv 10</span>
          </div>
          <div className='learn-btn' onClick={() => navigate('/wallet')}>Learn more</div>
        </div>
      </Popup>
      <Popup visible={isShowAddGas}
      onMaskClick={() => {
        setShowAddGas(false)
      }}
      bodyStyle={{
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
      className='popup-unlock'>
        <div className='pop-unlock-content maxWidth'>
          <div className='close' onClick={() => setShowAddGas(false)}>
            <img src='/assets/common/close.png' />
          </div>
          <img src="/assets/task/gas.png" alt="auto" className='auto-img'/>
          <div className='auto-title'>Refill the fuel tank</div>
          <div className='auto-desc'>Enjoy {systemInfo?.free_gas} free fuel tank refills per day!</div>
          <div className='free'>
            <img src='/assets/common/score.png' />
            <span className='free-title'>Free</span>
            <span className='lv'><span className='high'>{userInfo?.free_gas}&nbsp;/</span>&nbsp;{systemInfo?.free_gas}</span>
            </div>
          <div className={`learn-btn ${userInfo.free_gas ? '' : 'btn-disable'}`} onClick={() => handleAddGas()}>Fill up immediately</div>
        </div>
      </Popup>
    <BackTop scrollName='content' />
  </div>
}
export default TaskPage