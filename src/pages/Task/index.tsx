import './index.scss'
import { useEffect, useState } from 'react'
import { taskListReq, handleTakReq } from '@/api/task'
import { initHapticFeedback, initUtils, postEvent } from '@telegram-apps/sdk'
import { Button, Popover, Popup, Skeleton, Tabs, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import BackTop from '@/components/BackTop'
import { useDispatch, useSelector } from 'react-redux'
import { addgasGameReq } from '@/api/game'
import { setUserInfoAction } from '@/redux/slices/userSlice'
import { useLaunchParams } from '@telegram-apps/sdk-react'
import { Counter } from '@/components/Counter'
import { getSignature } from '@/utils/common'

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
  const [isShowTotal, setShowTotal] = useState(false)
  const [isShowDriver, setShowDriver] = useState(false)

  const handleShowTotal = () => {
    if (isShowTotal) {
      setShowTotal(false)
    } else {
      setShowTotal(true)
      setShowDriver(false)
    }
  }

  const handleShowDriver = () => {
    if (isShowDriver) {
      setShowDriver(false)
    } else {
      setShowAddGas(false)
      setShowDriver(true)
    }
  }

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
      Toast.show({ content: 'Please wait!' })
      return
    }
    if (item.status != 'Done') {
      const _list = JSON.parse(JSON.stringify(list))
      setTaskLoading(true)
      _list[index][cIndex].loading = true
      setList(_list)
      const post_data = {
        ...item,
        timeStamp: Date.now(),
        sign: ''
      }
      post_data.sign = getSignature(post_data)
      const res = await handleTakReq(post_data)
      if (res.code == 0) {
        setTimeout(() => {
          const _list = JSON.parse(JSON.stringify(list))
          _list[index][cIndex].status = res.data.taskItem.status
          _list[index][cIndex].loading = false
          dispatch(setUserInfoAction({ score: res.data.score }))
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
        if (localStorage.getItem('h5PcRoot') == '1') {
          if (item.linkType == 'self') {
            navigate(item.link)
          } else {
            const open = window.open(item.link)
            if (!open) {
              location.href = item.link
            }
          }
        } else if (launchParams.platform == 'tdesktop') {
          if (item.linkType == 'self') {
            navigate(item.link)
          } else {
            postEvent('web_app_open_link', { url: item.link })
          }
        } else {
          if (item.linkType.includes('telegram')) {
            utils.openTelegramLink(item.link)
          } else if (item.linkType == 'outside') {
            // location.href = item.link
            postEvent('web_app_open_link', { url: item.link })
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
        const _list = [...claimList, ...nullList, ...doneList]
        const nList = [[], []]
        _list.map((item: any) => {
          if (item.type == 'Partner') {
            nList[0].push(item)
          } else {
            nList[1].push(item)
          }
        })
        setList(nList)
      }
    })
  }, [])
  return <div className='task-page fadeIn'>
    <div className='task-title'>
      <div className='ky'>
        <div className='ky-label'>Available Points</div>
        <div className='ky-score'>
          <Counter end={userInfo?.score} duration={2000} />
        </div>
      </div>
      <div className='total'>
        <div className='total-label'>
          Total Points Earned
          <Popover
            content='The mysterious surprise you will receive will depend on your accumulated points'
            placement='top'
            mode='dark'
            trigger='click'
          >
            <span className='touch-btn' onClick={() => handleShowTotal()}>?</span>
          </Popover>
        </div>
        <div className='total-score'><Counter end={userInfo?.score} duration={2000} /></div>
      </div>
      <div className='right-score'>
        <div className='right-score-item'>
          <div className='rs-label'>Correct guesses</div>
          <div className='rs-code'>
            <img src="/assets/common/score.png" alt="score" />
            {systemInfo?.right_score}</div>
        </div>
        <div className='right-score-item'>
          <div className='rs-label'>
            Hourly autonomous driving
            <Popover
              content='The points you can earn per hour through autonomous driving'
              placement='top'
              mode='dark'
              trigger='click'
            >
              <span className='touch-btn' onClick={() => handleShowDriver()}>?</span>
            </Popover>
          </div>
          <div className='rs-code'>
            <img src="/assets/common/score.png" alt="score" />
            {systemInfo?.auto_driver}
          </div>
        </div>
      </div>
    </div>

    <div className='update-title'>Upgrade</div>
    <div className='gas-container'>
      {/*<div className='gas-item'>
        <img src='/assets/task/auto.png' className='gas-icon' />
        <div className='gas-title'>Auto Driver<span>New</span></div>
        {
          !userInfo.auto_driver ? <div className='gas-mask touch-btn' onClick={() => handleUnLock()}>
            <img src='/assets/task/unlock.png' className='lock-img' />
            <div className='unlock'>
              UnLock
              <img src='/assets/task/right.png' />
            </div>
          </div> : <div></div>
        }
      </div>
      */}
      <div className='gas-item touch-btn' onClick={() => setShowAddGas(true)}>
        <img src='/assets/task/gas.png' className='gas-icon' />
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
      <Tabs>
        <Tabs.Tab title='Event Partner Tasks' key='Partner' >
          {
            list.length && list[0].map((citem: any, cindex: number) => {
              return <div key={cindex} className='task-list-item'>
                <div className='task-list-left'>
                  <div className='middle'>
                    <img src={`/assets/task/${citem.logo}.png`} />
                    <div>
                      <div className='middle-name'>
                        {citem.name}
                      </div>
                      <div className='reward'>
                        <span>+{citem?.score?.toLocaleString()}</span>
                        &nbsp;<img src='/assets/common/score.png' alt='tomato' className='unit-img' />
                        &nbsp;Pts
                      </div>
                    </div>
                  </div>
                </div>
                <div className='task-list-right'>
                  <Button className={`task-list-right-btn touch-btn ${citem.status}`} onClick={() => handleDoTask(citem, 0, cindex)} loading={citem.loading}>
                    {
                      citem.status || 'Start'
                    }
                  </Button>
                </div>
              </div>
            })
          }
        </Tabs.Tab>
        <Tabs.Tab title='Driver Tasks' key='Driver' >
          {
            list.length && list[1].map((citem: any, cindex: number) => {
              return <div key={cindex} className='task-list-item'>
                <div className='task-list-left'>
                  <div className='middle'>
                    <div>
                      <div className='middle-name'>{citem.name}</div>
                      <div className='reward'>
                        <span>+{citem?.score?.toLocaleString()}</span>
                        &nbsp;<img src='/assets/common/score.png' alt='tomato' className='unit-img' />
                        &nbsp;Pts
                      </div>
                    </div>
                  </div>
                </div>
                <div className='task-list-right'>
                  <Button className={`task-list-right-btn touch-btn ${citem.status}`} onClick={() => handleDoTask(citem, 1, cindex)} loading={citem.loading}>
                    {
                      citem.status || 'Start'
                    }
                  </Button>
                </div>
              </div>
            })
          }
        </Tabs.Tab>
      </Tabs>
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
        <img src="/assets/task/auto.png" alt="auto" className='auto-img' />
        <div className='new'>New</div>
        <div className='auto-title'>Auto Driver</div>
        <div className='auto-desc'>Bind your Telegram account with Portkey and complete identity authentication to unlock autonomous driving. During your offline period, the game will automatically continue and earn points.</div>
        <div className='free'>
          <img src='/assets/common/score.png' />
          <span className='free-title'>Free</span>
          <span className='lv'>Lv 4</span>
        </div>
        <div className='learn-btn' onClick={() => navigate('/wallet')}>Learn More</div>
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
        <img src="/assets/task/gas.png" alt="auto" className='auto-img' />
        <div className='auto-title'>Refill the fuel tank</div>
        <div className='auto-desc'>Enjoy {systemInfo?.free_gas} free fuel tank refills per day!</div>
        <div className='free'>
          <img src='/assets/common/score.png' />
          <span className='free-title'>Free</span>
          <span className='lv'><span className='high'>{userInfo?.free_gas}&nbsp;/</span>&nbsp;{systemInfo?.free_gas}</span>
        </div>
        <div className={`learn-btn ${userInfo.free_gas ? '' : 'btn-disable'} touch-btn`} onClick={() => handleAddGas()}>Fill up immediately</div>
      </div>
    </Popup>
    <BackTop scrollName='content' />
  </div>
}
export default TaskPage