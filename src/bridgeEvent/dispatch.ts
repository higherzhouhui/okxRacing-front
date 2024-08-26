import {
  TWalletInfo,
  WalletTypeEnum,
} from "@aelf-web-login/wallet-adapter-base";
import { NotificationEvents } from "./constants";

export class PortkeyBridgeEventPost {
  static connectStatueChanged(isConnected: boolean) {
    window.dispatchEvent(
      new CustomEvent(NotificationEvents.connectChanged, {
        detail: JSON.stringify(isConnected),
      })
    );
  }

  static walletInfoChanged(walletInfo: TWalletInfo) {
    window.dispatchEvent(
      new CustomEvent(NotificationEvents.walletChanged, {
        detail: JSON.stringify(walletInfo),
      })
    );
  }

  static LockStatusChanged(isLocking: boolean) {
    window.dispatchEvent(
      new CustomEvent(NotificationEvents.lockStatus, {
        detail: JSON.stringify(isLocking),
      })
    );
  }
  static WalletTypeChanged(walletType: WalletTypeEnum) {
    window.dispatchEvent(
      new CustomEvent(NotificationEvents.walletTypeChanged, {
        detail: JSON.stringify(walletType),
      })
    );
  }
}
