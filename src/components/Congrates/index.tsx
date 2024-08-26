import { useEffect, useState } from 'react'
import './index.scss'

function CongratesComp({ visible, time, callBack }: { visible: boolean, time: number, callBack: () => void }) {
  const [isVisible, setIsVisible] = useState(visible)
  useEffect(() => {
    setIsVisible(visible)
    if (visible) {
      setTimeout(() => {
        setIsVisible(false)
        callBack()
      }, time);
    }
  }, [visible])
  return <>
    {
      isVisible ? <div className='penalty'>
        <img src="/assets/common/yhboom.gif" alt="penalty" />
      </div> : null
    }
  </>
}

export default CongratesComp;