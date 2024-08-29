import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import { useEffect } from "react";
import { PortkeyBridgeEventReceiveInstance } from "../../bridgeEvent/on";
import { PortkeyBridgeEventPost } from "../../bridgeEvent/dispatch";
import { NotificationEvents } from "../../bridgeEvent/constants";
import { bindWalletReq, h5PcLoginReq } from '@/api/common'
import { Toast } from "antd-mobile";
import { useDispatch } from "react-redux";
import { setUserInfoAction } from "@/redux/slices/userSlice";
import EventBus from "@/utils/eventBus";
import { useNavigate } from "react-router-dom";
import moment from "moment";
export default function BridgeUpdater() {
  const provider = useConnectWallet();
  const dispatch = useDispatch()
  const eventBus = EventBus.getInstance()
  const navigate = useNavigate()
  const bindWallet = async (walletInfo: any) => {
    const res = await bindWalletReq(walletInfo)
    if (res.code !== 0) {
      Toast.show({ content: res.msg, position: 'top' })
    } else {
      dispatch(setUserInfoAction(res.data))
    }
  }

  const h5PcLogin = async (walletInfo: any) => {
    eventBus.emit('loading', true)
    let url = location.hash
    if (url) {
      url = url.replace('#', '')
    }
    const res = await h5PcLoginReq(walletInfo)
    if (res.code !== 0) {
      Toast.show({ content: res.msg, position: 'top' })
    } else {
      dispatch(setUserInfoAction(res.data))
      localStorage.setItem('authorization', res.data.user_id)
      localStorage.setItem('walletInfo', JSON.stringify(walletInfo))
      if (res.data.check_date) {
        const today = moment().utc().format('MM-DD')
        if (res.data.check_date != today) {
          navigate('/checkIn')
        } else {
          navigate(url)
        }
      } else {
        navigate('/checkIn')
      }
    }
    eventBus.emit('loading', false)
  }


  useEffect(() => {
    if (!window.PortkeyBridge) window.PortkeyBridge = {};
    console.log(provider, "NotificationEvents ==provider===");
    window.PortkeyBridge = provider;
  }, [provider]);

  useEffect(() => {
    PortkeyBridgeEventPost.connectStatueChanged(provider.isConnected);
  }, [provider.isConnected]);

  useEffect(() => {
    PortkeyBridgeEventPost.walletInfoChanged(provider.walletInfo);
  }, [provider.walletInfo]);

  useEffect(() => {
    PortkeyBridgeEventPost.LockStatusChanged(provider.isLocking);
  }, [provider.isLocking]);

  useEffect(() => {
    PortkeyBridgeEventPost.WalletTypeChanged(provider.walletType);
  }, [provider.walletType]);

  useEffect(() => {
    const r1 = PortkeyBridgeEventReceiveInstance.on(
      NotificationEvents.connectChanged,
      (event) => {

        console.log(event, "NotificationEvents.connectChanged");
      }
    );
    const r2 = PortkeyBridgeEventReceiveInstance.on(
      NotificationEvents.lockStatus,
      (event) => {
        console.log(event, "NotificationEvents.lockStatus");
      }
    );
    const r3 = PortkeyBridgeEventReceiveInstance.on(
      NotificationEvents.walletChanged,
      (event) => {
        // 这里对address进行修改
        if (event?.address) {
          if (localStorage.getItem('h5PcRoot') == '1') {
            const name = event?.extraInfo?.nickName || event?.name
            h5PcLogin({
              wallet: event?.address,
              wallet_nickName: name,
              username: name,
            })
          } else {
            bindWallet({
              wallet: event?.address,
              wallet_nickName: event?.extraInfo?.nickName,
            })
          }
        }
        // 如果无wallet任何信息，则清空数据
        if (!event) {
          localStorage.setItem('authorization', '')
          localStorage.setItem('walletInfo', '')
        }
        console.log(event, "NotificationEvents.walletChanged");
      }
    );
    const r4 = PortkeyBridgeEventReceiveInstance.on(
      NotificationEvents.walletTypeChanged,
      (event) => {
        console.log(event, "NotificationEvents.walletTypeChanged");
        r4.remove();
      }
    );
    return () => {
      r1.remove();
      r2.remove();
      r3.remove();
      r4.remove();
    };
  }, []);

  return null;
}
