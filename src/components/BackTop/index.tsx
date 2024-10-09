import { useEffect, useState } from 'react';
import './index.scss'
import { throttle } from '@/utils/common';

function BackTop({ scrollName }: { scrollName?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  // 判断是否显示回到顶部按钮
  const toggleVisibility = () => {
    const layoutElement = document.getElementsByClassName(scrollName || 'content')[0]
    if (layoutElement) {
      if (layoutElement.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false)
    }
  };

  // 滚动事件监听器
  useEffect(() => {
    const layoutElement = document.getElementsByClassName(scrollName || 'content')[0]
    if (layoutElement) {
      layoutElement.addEventListener('scroll', throttle(toggleVisibility, 50))
    }
    return () => {
      layoutElement.removeEventListener('scroll', throttle(toggleVisibility, 50));
    };
  }, []);

  // 点击按钮回到顶部
  const scrollToTop = () => {
    const layoutElement = document.getElementsByClassName(scrollName || 'content')[0]

    layoutElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return <div className='back-top' onClick={() => scrollToTop()} style={{ display: isVisible ? 'block' : 'none' }}>
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3893" width="32" height="32"><path d="M875.893312 611.9412 527.519973 263.566838 179.145611 611.9412 328.449056 611.9412 328.449056 918.323169 726.590891 918.323169 726.590891 611.9412Z" fill="#1296db" p-id="3894"></path><path d="M79.611687 72.248488l895.817596 0 0 87.119173-895.817596 0 0-87.119173Z" fill="#1296db" p-id="3895"></path></svg>
  </div>
}

export default BackTop