import * as testnetConfig from "./login.config.testnet";
import * as mainnetConfig from "./login.config.mainnet";

export default import.meta.env.VITE_NETWORK_TYPE === "TESTNET"
  ? testnetConfig
  : mainnetConfig;
