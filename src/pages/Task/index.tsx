import { useEffect, useState } from 'react'
import './index.scss'
import { taskListReq, handleTakReq } from '@/api/task'
import { initUtils } from '@telegram-apps/sdk'
import { Button, Skeleton, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import BackTop from '@/components/BackTop'

function TaskPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const handleDoTask = async (item: any, index: number, cIndex: number) => {
    if (item.status != 'Done') {
      const _list = JSON.parse(JSON.stringify(list))
      _list[index][cIndex].loading = true
      setList(_list)
      const res = await handleTakReq(item)
      if (res.code == 0) {
        const _list = JSON.parse(JSON.stringify(list))
        _list[index][cIndex].status = res.data.status
        _list[index][cIndex].loading = false
        setList(_list)
      } else {
        Toast.show({ content: res.msg, position: 'top' })
        const _list = JSON.parse(JSON.stringify(list))
        _list[index][cIndex].loading = false
        setList(_list)
      }
      if (item.status == null) {
        if (localStorage.getItem('h5PcRoot') == '1') {
          window.open(item.link)
        } else {
          if (item.linkType.includes('telegram')) {
            const utils = initUtils()
            utils.openLink(item.link)
          } else if (item.linkType == 'outside') {
            window.open(item.link)
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
    if (img.includes('portkey')) {
      return 'portkey'
    }
    if (img.includes('Aelf')) {
      return 'aelf'
    }
    return 'game'
  }


  useEffect(() => {
    setLoading(true)
    taskListReq().then(res => {
      setLoading(false)
      if (res.code == 0) {
        res.data.map(item => {
          item.loading = false
        })
        const list = groupByType(res.data)
        setList(list)
      }
    })
  }, [])
  return <div className='task-page fadeIn'>
    <div className='task-title'>
      <img src='/assets/tasks.gif' alt='task' width={150} />
      <div className='task'>Tasks</div>
      <div className='desc'>Complete tasks to earn $CAT</div>
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
              <img src='/assets/task/touch.png' className='touch' />
            </div>
            {
              item.map((citem: any, cindex: number) => {
                return <div key={cindex} className='task-list-item'>
                  <div className='task-list-left'>
                    <div className='middle'>
                      <div className='middle-name'>{citem.name}</div>
                      <div className='reward'>
                        <span>+{citem?.score?.toLocaleString()}</span>
                        &nbsp;<img src='/assets/common/cat.webp' alt='tomato' className='unit-img' />
                        &nbsp;$CAT
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
    <BackTop scrollName='content' />
  </div>
}
export default TaskPage