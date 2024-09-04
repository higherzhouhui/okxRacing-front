import './index.scss'
import { Space, Swiper, SwiperRef } from 'antd-mobile'
import { useEffect, useRef, useState } from 'react'
import { levelListReq } from '@/api/game'
import { useSelector } from 'react-redux'
import EventBus from '@/utils/eventBus'

function LevelPage() {
  const ref = useRef<SwiperRef>(null)
  const [levelList, setLevelList] = useState([])
  const userInfo = useSelector((state: any) => state.user.info);
  const eventBus = EventBus.getInstance()
  const [percent, setPercent] = useState(0)
  const [level, setLevel] = useState(1)
  useEffect(() => {
    eventBus.emit('loading', true)
    levelListReq().then(res => {
      eventBus.emit('loading', false)
      if (res.code == 0) {
        setLevelList(res.data)
        for (let i = 0; i < res.data.length; i++ ) {
          if (res.data[i].score > userInfo?.score) {
            setLevel(res.data[i].level)
            let last_score = 0
            if (i != 0) {
              last_score = res.data[i - 1].score
            }
            const _p = (userInfo.score - last_score) / (res.data[i].score - last_score) * 100
            setPercent(_p)
            break;
          }
        }
      }
    })
  }, [])

  const items = levelList.map((item, index) => (
    <Swiper.Item key={index}>
      <div
        className='list-item'
      >
        <div className='img-wrapper'>
          <img src='/assets/wallet/lv.png' alt='lv' />
          <div className='lv-num'>{item.level}</div>
        </div>
        {
          level == item.level ? <div className='current'>Current driver level</div> : null
        }
        <div className='label'>{item.name}</div>
        <div className='normal-score'>
          {
            index == levelList.length - 1 ? <span>{Number(item.score).toLocaleString()} &nbsp;points or more</span>
              : item.level == 1 ? <span>{Number(levelList[0].score).toLocaleString()} &nbsp;points or less</span>
              : <span><span>{Number(item.score).toLocaleString()} ~ </span>{Number(levelList[index + 1].score).toLocaleString()} &nbsp;PTS</span>
          }
        </div>
        {
          level == item.level ? <div className='progress'>
          <div className='percent' style={{width: `${percent}%`}}/>
        </div> : null
        }
        <svg onClick={() => {
            ref.current?.swipePrev()
          }} viewBox="0 0 1024 1024" className='icon left' version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4487" width="32" height="32"><path d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m158.4 674.4L625.6 784l-272-272 272-272 45.6 45.6L444 512l226.4 226.4z" p-id="4488" fill="#cdcdcd"></path></svg>
          <svg onClick={() => {
            ref.current?.swipeNext()
          }} viewBox="0 0 1024 1024" className='icon right' version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2275" width="32" height="32"><path d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64zM398.4 784l-45.6-45.6L580 512 353.6 285.6l45.6-45.6 272 272-272.8 272z" p-id="2276" fill="#cdcdcd"></path></svg>
      </div>
    </Swiper.Item>
  ))
  return (
    <div className='level-page'>
      <Space direction='vertical' block>
        <Swiper allowTouchMove={false} ref={ref} loop>
          {items}
        </Swiper>
      </Space>
    </div>
  )
}
export default LevelPage;