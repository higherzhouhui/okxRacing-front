import { Toast } from "antd-mobile";
import moment from "moment";
import md5 from "js-md5";

export function stringToColor(string: string) {
  if (!string) {
    return '#fff'
  }
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function formatNumber(num: any, hz?: number) {
  if (isNaN(num)) {
    return num
  }
  // 小于千直接返回  
  if (num < 1000) {
    return num;
  }
  let fixed = 2
  if (hz != undefined) {
    fixed = hz
  }
  // 超过千  
  if (num < 1000000) {
    return (num / 1000).toFixed(fixed) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(fixed) + 'M';
  } else {
    return (num / 1000000000).toFixed(fixed) + 'B';
  }
}
export function secondsToTimeFormat(seconds: number) {
  let minutes: any = Math.floor(seconds / 60);
  let secs: any = seconds % 60;

  minutes = minutes < 10 ? '0' + minutes : minutes;
  secs = secs < 10 ? '0' + secs : secs;

  return minutes + ':' + secs;
}



export function judgeIsCheckIn(time: any) {
  let flag = false
  try {
    if (time) {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const day = currentDate.getDate()
      const currentArr = [year, month, day]
      const timeymd = moment(time).format('YYYY-MM-DD').split('-')
      flag = timeymd.every((item: any, index: number) => {
        return parseInt(item) == currentArr[index]
      })
    }
  } catch (error) {
    console.error(error)
    flag = false
  }
  return flag
}

export function judgeIsStartFarming(end_farm_time: any, last_farming_time: any) {
  let canFarming = true
  let score: any = 0
  let percent = 0
  let leftTime = 180
  const total = 1080
  if (end_farm_time && last_farming_time) {
    const now = new Date().getTime()
    const end = new Date(end_farm_time).getTime()
    const last = new Date(last_farming_time).getTime()
    const start = end - 3 * 60 * 60 * 1000
    // 如果采摘时间大于结束时间，说明已经完全收完，可以开始下一次
    if (now < end) {
      canFarming = false
      score = Math.abs(Math.round((now - start) / 1000) * 0.1)
      score = score.toFixed(1)
      percent = Math.ceil(score / total * 100)
      leftTime = Math.ceil(180 * (100 - percent) / 100) || 1
    } else {
      if (last < end) {
        canFarming = false
        score = total
        percent = 100
        leftTime = 0
      }
    }
  }

  return {
    canFarming,
    score,
    percent,
    leftTime
  }
}


export function formatWalletAddress(address: any) {
  let str = address
  try {
    if (address) {
      str = address.substring(0, 5) + '...' + address.substring(address.length - 5)
    }
  } catch (error) {

  }

  return str
}


export function handleCopyLink(link: string, toast?: string) {
  const textToCopy = link; // 替换为你想要复制的内容  
  const textArea = document.createElement("textarea");
  textArea.value = textToCopy;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  Toast.show({ content: toast || 'The link has been copied to the clipboard.', position: 'top', duration: 3000 })
}

type ThrottleHandler = (args: any[]) => void;

export function throttle(handler: ThrottleHandler, limit: number) {
  let inThrottle: boolean = false;
  let lastArgs: any[] = [];

  return function (...args: any[]) {
    const context = this;

    if (!inThrottle) {
      handler.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}


export const accordingEthToBtc = (result: any) => {
  let btc = 0
  try {
    const { ethbtc, ethusd } = result
    btc = Math.round(ethusd / ethbtc * 100) / 100
  } catch (error) {
    console.error(error)
  }
  return btc
}

export const dataSerialize = (sortObj: any) => {
  let strJoin = ''
  for (let key in sortObj) {
    if (sortObj[key] || sortObj[key] == 0) {
      strJoin += key + "=" + sortObj[key] + "&"
    }
  }
  return strJoin
}

// 参数排序
export function dataSort(obj: any) {
  if (JSON.stringify(obj) == "{}" || obj == null) {
    return {}
  }
  let key = Object.keys(obj)?.sort()
  let newObj: any = {}
  for (let i = 0; i < key.length; i++) {
    newObj[key[i]] = obj[key[i]]
  }
  return newObj
}


export const getSignature = (content: any) => {
  const secretKey = 'YpEzusH5qFVd3hPe8cwYhyLZdh88Bpe'
  const objStr = dataSerialize(dataSort(content))
  console.log(objStr, 1111111111)
  const signature = md5(objStr + "secretKey=" + secretKey);
  return signature.toLocaleUpperCase()
}