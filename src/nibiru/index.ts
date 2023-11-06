import type { LocalConfig } from '@/stores';

const PLAYGROUND_NETWORKS = 'https://networks.play.nibiru.fi/ping-pub';
const DEV_NETWORKS = 'https://networks.testnet.nibiru.fi/ping-pub';
const ITN_NETWORKS = 'https://networks.itn.nibiru.fi/ping-pub';

export const getItn = async (): Promise<LocalConfig[] | undefined> => {
  try {
    const testnets = await fetch(ITN_NETWORKS).then((response) =>
      response.json()
    );
    testnets.forEach((_: any, i: string | number) => {
      testnets[i].visible = true;
    });
    return testnets;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getDevnets = async (): Promise<LocalConfig[] | undefined> => {
  try {
    const devnets = await fetch(DEV_NETWORKS).then((response) =>
      response.json()
    );
    devnets.forEach((_: any, i: string | number) => {
      devnets[i].visible = false;
    });
    return devnets;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getPlaynets = async (): Promise<LocalConfig[] | undefined> => {
  try {
    const playnets = await fetch(PLAYGROUND_NETWORKS).then((response) =>
      response.json()
    );
    playnets.forEach((_: any, i: string | number) => {
      playnets[i].visible = false;
    });
    return playnets;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getNibiruChains = async (): Promise<{
  [key: string]: LocalConfig;
}> => {
  const [playnets, devnets, itn] = await Promise.all([
    undefined, //getPlaynets(),
    undefined, //getDevnets(),
    getItn(),
  ]);
  const chains = (itn ?? []).concat(playnets ?? [], devnets ?? []);
  const chainsObj: { [key: string]: LocalConfig } = {};
  chains.forEach((chain) => {
    chainsObj[chain.chain_name] = chain;
  });
  return chainsObj;
};
