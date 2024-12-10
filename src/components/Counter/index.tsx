import { useState, useRef, useEffect } from "react";

export const Counter = ({ end, duration = 2000 }: {end: number, duration: number}) => {
  const [current, setCurrent] = useState(0);
  const finalValueRef = useRef(end);
  const timerRef = useRef<any>(null);
  const preValueRef = useRef(0)
  useEffect(() => {
    // 更新 finalValueRef 当 end prop 改变时
    finalValueRef.current = end;

    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 计算每次递增的步长
    const totalSteps = Math.ceil(duration / 16); // 假设每帧16ms，大约60fps
    const step = Math.ceil(end / totalSteps);

    // 初始化当前值
    setCurrent(preValueRef.current);

    // 设置定时器以递增 current 值
    timerRef.current = setInterval(() => {
      setCurrent(prev => {
        if (prev + step >= finalValueRef.current) {
          clearInterval(timerRef.current);
          preValueRef.current = end
          return finalValueRef.current;
        }
        return prev + step;
      });
    }, duration / totalSteps);

    // 清理定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [end, duration]);

  return <span style={{fontFamily: 'inherit'}}>{current.toLocaleString()}</span>;
};