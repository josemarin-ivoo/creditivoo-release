import RNFS from 'react-native-fs';

export const waitForFile = async (path: string, maxWaitMs = 5000, checkEveryMs = 300): Promise<boolean> => {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const exists = await RNFS.exists(path);
    if (exists) return true;
    await new Promise(resolve => setTimeout(resolve, checkEveryMs));
  }
  return false;
};