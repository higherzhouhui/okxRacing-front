import { useEffect, useState } from 'react'
import './index.scss'
import { getCheckInRewardListReq, userCheckReq } from '@/api/common'
import { formatNumber } from '@/utils/common'
import { Button } from 'antd-mobile'
import { useDispatch } from 'react-redux'
import { setUserInfoAction } from '@/redux/slices/userSlice'
import EventBus from '@/utils/eventBus'
import { useNavigate } from 'react-router-dom'

function CheckInPage() {
  const dispatch = useDispatch()
  const eventBus = EventBus.getInstance()
  const [checkObj, setCheckObj] = useState<any>()
  const [changeScale, setChangeScale] = useState(false)
  const [rewardsList, setRewardList] = useState([])
  const navigate = useNavigate()
  const checkIn = async () => {
    const res = await userCheckReq()
    setCheckObj(res.data)
    dispatch(setUserInfoAction(res.data))
    setTimeout(() => {
      eventBus.emit('showCongrates', { time: 1500, visible: true })
    }, 2000);
  }

  const handleContinue = () => {
    navigate('/')
  }
  useEffect(() => {
    checkIn()
    getCheckInRewardListReq().then(res => {
      if (res.code == 0) {
        setRewardList(res.data)
      }
    })
  }, [])


  useEffect(() => {
    if (checkObj?.day) {
      setTimeout(() => {
        setChangeScale(true)
      }, 4000);
    }
  }, [checkObj])

  return <div className='checkIn-container'>
    <div className='checkIn-first'>
      <img src='/assets/common/congrate.png' alt='hooray' className={`hooray ${changeScale ? 'change-hooray' : ''}`} />
      <div className={`daily-reward ${changeScale ? 'change-daily' : ''}`}>
        {
          !changeScale ? <div className='day'>
            {checkObj?.day}
          </div> : null
        }
        Daily Rewards
      </div>
      {
        !changeScale ? <div className={`rewards-container ${checkObj?.reward_score ? 'fadeIn' : ''}`}>
          <span>Rewards</span>
          <img src="/assets/common/cat.webp" alt="logo" className='rewards-logo' />
          {checkObj?.reward_score}
        </div> : null
      }
      <div className={`${changeScale ? 'fadeIn' : ''} rewards-detail`}>
        <div className='rewards-detail-top'>
          <div className='rewards-two'>
            <div className='rewards-one'>
              <img src='/assets/common/cat.webp' alt='logo' />
              <div className='reward-number'>{checkObj?.reward_score}</div>
              <div className='unit'>$CAT</div>
            </div>
            <div className='rewards-one'>
              <img src='/assets/common/ticket.webp' alt='logo' />
              <div className='reward-number'>{checkObj?.reward_ticket}</div>
              <div className='unit'>Tickets</div>
            </div>
          </div>
          <div className='check-in-title'>Daily Check-in Rewards</div>
          <div className='rewards-list'>
            {
              rewardsList.map((item: any, index) => {
                return <div key={index} className={`rewards-item ${checkObj?.day > index ? 'rewards-item-active' : ''}`}>
                  <div className='rewards-item-left'>
                    <div className='count'>{item.day}</div>
                    <div className='desc'>Day</div>
                  </div>
                  <div className='rewards-item-right'>
                    {
                      checkObj?.day > index ? <img src="/assets/toast-success.webp" alt="check" /> : <>
                        <div className='score-ticket'>
                          {formatNumber(item.score, 0)}&nbsp;
                          <img src='/assets/common/cat.webp' alt='logo' />
                        </div>
                        <div className='score-ticket ticket-pic'>
                          {item.ticket}&nbsp;
                          <img src='/assets/common/ticket.webp' alt='logo' />
                        </div>
                      </>
                    }
                  </div>
                </div>
              })
            }
          </div>
        </div>
        <div className='rewards-detail-top'>
          <Button color="default" style={{ fontWeight: 'bold', flex: 1 }} onClick={() => handleContinue()}>Continue</Button>
        </div>
      </div>
    </div>
  </div>
}

export default CheckInPage