import {
  TWalletInfo,
  WalletTypeEnum,
} from "@aelf-web-login/wallet-adapter-base";
import { NotificationEvents } from "./constants";

type TListenerReturn = {
  remove: () => void;
};

interface IPortkeyBridgeEventReceive {
  on(
    eventName: typeof NotificationEvents.connectChanged,
    listener: (response: boolean) => void
  ): TListenerReturn;
  on(
    eventName: typeof NotificationEvents.lockStatus,
    listener: (response: TWalletInfo | null) => void
  ): TListenerReturn;
  on(
    eventName: typeof NotificationEvents.walletChanged,
    listener: (response: boolean) => void
  ): TListenerReturn;
  on(
    eventName: typeof NotificationEvents.walletTypeChanged,
    listener: (response: WalletTypeEnum) => void
  ): TListenerReturn;

  on<T = any>(
    eventName: (typeof NotificationEvents)[keyof typeof NotificationEvents],
    listener: (eventName: T) => void
  ): TListenerReturn;
}

class PortkeyBridgeEventReceive implements IPortkeyBridgeEventReceive {
  on<T = any>(
    eventName: (typeof NotificationEvents)[keyof typeof NotificationEvents],
    listener: (eventName: T) => void
  ) {
    const __listener = (event: any) => {
      // listener(customEvent);

      const customEvent = event as CustomEvent<string>;
      const data = JSON.parse(customEvent.detail);
      listener(data);
    };

    window.addEventListener(eventName, __listener);

    return {
      remove: () => {
        window.removeEventListener(eventName, __listener);
      },
    };
  }
}

export const PortkeyBridgeEventReceiveInstance =
  new PortkeyBridgeEventReceive();
