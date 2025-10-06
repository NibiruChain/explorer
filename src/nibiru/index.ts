import type { LocalChainConfig } from '@/types/chaindata';

const PLAYGROUND_NETWORKS = 'https://networks.play.nibiru.fi';
const DEV_NETWORKS = 'https://networks.devnet.nibiru.fi';
const ITN_NETWORKS = 'https://networks.testnet.nibiru.fi';
const MAIN_NETWORK = 'https://networks.nibiru.fi';

export const getNetwork = async (url: string): Promise<LocalChainConfig[]> => {
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
  [key: string]: LocalChainConfig;
}> => {
  const [itn, dev, main] = await Promise.all([
    getNetwork(ITN_NETWORKS),
    getNetwork(DEV_NETWORKS),
    getNetwork(MAIN_NETWORK),
  ]);

  const chains = dev.concat(itn).concat(main);
  const chainsObj: { [key: string]: LocalChainConfig } = {};
  chains.forEach((chain) => {
    chainsObj[chain.chain_name] = chain;
  });
  return chainsObj;
};
