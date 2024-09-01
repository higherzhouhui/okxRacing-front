import { FC, useEffect, useState } from 'react';
import './index.scss'
import { InfiniteScroll, List, Popup, Tabs } from 'antd-mobile';

function LeaderBoardPage() {
  const [isShowRecord, setShowRecord] = useState(false)
  const [recordList, setRecordList] = useState([])
  const handleShowRecord = () => {
    setShowRecord(true)
  }
  return <div className='fadeIn leader-page'>
    <div className='title'>赛车手<span>排行榜</span></div>
    <div className='sub-title'>查看你的排名，挑战顶尖车手！</div>
    <div className='record-btn' onClick={() => handleShowRecord()}>
      <span>我的记录</span>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2231" width="10" height="10"><path d="M326.7079 958.51045l-63.278185-60.523445L651.328255 512.841158 257.924327 124.944664l66.024739-60.523445 445.672362 448.419939L326.7079 958.51045z" fill="#ffffff" p-id="2232"></path></svg>
    </div>
    <Tabs>
      <Tabs.Tab title='朋友' key='fruits'>
        <CustomList />
      </Tabs.Tab>
      <Tabs.Tab title='全球' key='vegetables'>
        全球
      </Tabs.Tab>
    </Tabs>


    <Popup visible={isShowRecord}
      onMaskClick={() => {
        setShowRecord(false)
      }}
      bodyStyle={{
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
      className='popup-rule'>
      111
    </Popup>
  </div>
}
type CustomListType = {
  type?: string
}
const CustomList: FC<CustomListType> = ({ type }) => {
  const [data, setData] = useState([1, 23])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const loadMore = async () => {
    console.log(type)
  }

  return <div className='custom-list'>
    <div className='custom-content'>
      <div className='custom-title'>
        <div className='ct-left'>{total}&nbsp;<span>名选手</span></div>
        <div className='ct-right'>历史总积分</div>
      </div>
      <div className='custom-lists'>
        {
          data.map((item, index) => {
            return <div key={index} className='custom-list'>
              <div className='custom-title'>
                <div className='ct-left'>
                  <div className='ctl-icon'>{index}</div>
                  <div className='ctl-name'>33</div>
                </div>
                <div className='ct-right'>历史总积分</div>
              </div>
            </div>
          })
        }
      </div>
    </div>
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
  </div>
}

export default LeaderBoardPage;