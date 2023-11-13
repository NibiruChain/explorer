import type { LocalConfig } from '@/stores';

const PLAYGROUND_NETWORKS = 'https://networks.play.nibiru.fi/ping-pub';
const DEV_NETWORKS = 'https://networks.testnet.nibiru.fi/ping-pub';
const ITN_NETWORKS = 'https://networks.itn.nibiru.fi/ping-pub';
const MAIN_NETWORK = 'https://networks.nibiru.fi/ping-pub';

export const getNetwork = async (url: string): Promise<LocalConfig[]> => {
  try {
    const net = await fetch(url).then((response) => response.json());
    net.forEach((_: any, i: string | number) => {
      net[i].visible = true;
    });
    return net;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getNibiruChains = async (): Promise<{
  [key: string]: LocalConfig;
}> => {
  const [itn] = await Promise.all([
    getNetwork(ITN_NETWORKS),
    // getNetwork(MAIN_NETWORK),
  ]);
  const chains = itn;
  const chainsObj: { [key: string]: LocalConfig } = {};
  chains.forEach((chain) => {
    chainsObj[chain.chain_name] = chain;
  });
  return chainsObj;
};
