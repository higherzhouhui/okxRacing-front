import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import './index.scss'
import { Button } from 'antd-mobile';
import { useSelector } from 'react-redux';
import { formatWalletAddress, handleCopyLink } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function WalletPage() {
  const router = useNavigate()
  const [isH5PcRoot, setH5PcRoot] = useState(false)
  const { connectWallet, isConnected, disConnectWallet, walletInfo, isLocking, lock } = useConnectWallet();
  const userInfo = useSelector((state: any) => state.user.info);
  const onConnectBtnClickHandler = async () => {
    try {
      await connectWallet();
    } catch (e: any) {
      console.error(e.message);
    }
  };
  const handleLock = () => {
    if (!isLocking) {
      lock()
    }
  }
  const handleAsset = async () => {
    if (isH5PcRoot) {
      await disConnectWallet()
    } else {
      router('/assets')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('h5PcRoot') == '1') {
      setH5PcRoot(true)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      if (!isConnected && !walletInfo) {
        setTimeout(() => {
          connectWallet()
        }, 500);
      }
    }, 1000);
  }, [isConnected, walletInfo])

  return <div className='wallet-page fadeIn'>
    <img src="/assets/wallet-1.png" alt="wallet" className='wallet-img' />
    <div className='wallet-page-title'>The time has come.</div>
    <div className='connect-wrapper'>
      <img src="/assets/money.png" alt="wallet" width={32} />
      {
        isConnected ? <div>
          <div className='connect-desc'>The best Wallet to Explore TON Ecosystem</div>
          <div className='connect-assets'>
            <div className='my-assets' onClick={() => handleCopyLink(userInfo.wallet)}>
              {formatWalletAddress(userInfo.wallet)}
            </div>
            {
              isH5PcRoot ? <div className='my-assets' onClick={lock}>
                {isLocking ? 'unLock' : 'Lock'}
              </div> : null
            }
            <div className='my-assets' onClick={() => handleAsset()}>
              {
                isH5PcRoot ? 'Disconnect' : <>
                  Assets
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2382" width="22" height="22"><path d="M640 832h256v64H640z" fill="#000000" p-id="2383"></path><path d="M571.08 850H452.92v-92.79L250.66 652.4a8.16 8.16 0 0 1-4.51-7.21V441.62l-87.58-45.84 57-98.32 94.4 49.4 197.89-102.54a9 9 0 0 1 8.28 0l99.61 51.62h239a127 127 0 0 0-24.88-16.88L572.72 145.77a132.15 132.15 0 0 0-121.43 0L194.08 279.06C153.32 300.18 128 340.7 128 384.82v260.36c0 44.11 25.32 84.63 66.08 105.76l257.2 133.28a132.09 132.09 0 0 0 120.22 0.61V757l-0.42 0.22z" p-id="2384" fill="#000000"></path><path d="M452.92 513.25h55.68l-26.09-44.92 29.74-15.59L310 346.87l-59.34 30.73a8.16 8.16 0 0 0-4.51 7.21v56.8l206.77 108.23z" p-id="2385" fill="#000000"></path><path d="M250.66 377.6L310 346.87l-94.4-49.4-57 98.32 87.58 45.84v-56.8a8.16 8.16 0 0 1 4.48-7.23zM563.48 425.88l-51.22 26.85 30.86 16.15-25.73 44.37h53.69v36.85l130.03-68.17H563.48v-56.05z" p-id="2386" fill="#000000"></path><path d="M508.6 513.25h8.79l25.73-44.37-30.86-16.15-29.75 15.59 26.09 44.93zM513 520.82l-26.9 46.39-33.18-17.37v207.37l54.94 28.47a9 9 0 0 0 8.28 0l54.94-28.47V550.1l-31.48 16.5z" p-id="2387" fill="#000000"></path><path d="M507.86 785.68l-54.94-28.47V850h118.16v-92.79l-54.94 28.47a9 9 0 0 1-8.28 0zM452.92 513.25v36.59l33.19 17.36L513 520.82l-4.4-7.57h-55.68zM517.39 513.25l-4.39 7.57 26.6 45.79 31.48-16.51v-36.85h-53.69z" p-id="2388" fill="#000000"></path><path d="M513 520.82l4.39-7.57h-8.79l4.4 7.57zM777.85 481.93V441.7l-76.74 40.23h76.74z" p-id="2389" fill="#000000"></path><path d="M854.79 295.94h-239l98.36 51 94.28-49.43 57.09 98.28-87.67 45.91v40.23H896v-97.11c0-34.27-15.28-66.36-41.21-88.88z" p-id="2390" fill="#000000"></path><path d="M563.48 481.93h137.63l76.73-40.23v-56.88a8.16 8.16 0 0 0-4.51-7.21l-59.24-30.7-150.63 79z" p-id="2391" fill="#000000"></path><path d="M777.85 384.82v56.88l87.62-45.94-57.09-98.28-94.28 49.43 59.24 30.7a8.16 8.16 0 0 1 4.51 7.21z" p-id="2392" fill="#000000"></path><path d="M896 768H640V544h256z m-204.8-56h153.6V600H691.2zM736 768h64v96h-64z" fill="#000000" p-id="2393"></path></svg>
                </>
              }
            </div>
          </div>
        </div> : <>
          <div className='connect-desc'>Connect your PortKey Wallet</div>
          <div className='connect-intro'>The best Wallet to Explore TON Ecosystem</div>
          <Button onClick={onConnectBtnClickHandler} style={{ marginTop: '1rem', background: 'var(--btnBg)', border: 'none' }}>connect</Button>
        </>
      }
    </div>
    <div className='happing'>What's happening?</div>
    <div className='activity'>Somethings <span>HUGE</span> is coming in Oct.</div>
    <div className='activity'>connecting PortKey Wallet is the <span>first step</span>. Do not be late.</div>
  </div>
}

export default WalletPage