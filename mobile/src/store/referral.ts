import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERRAL_KEY = 'referral_code';

export const saveReferralCode = async (code: string) => {
  try {
    await AsyncStorage.setItem(REFERRAL_KEY, code);
  } catch (error) {
    console.error('Error saving referral code:', error);
  }
};

export const getReferralCode = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFERRAL_KEY);
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
};

export const clearReferralCode = async () => {
  try {
    await AsyncStorage.removeItem(REFERRAL_KEY);
  } catch (error) {
    console.error('Error clearing referral code:', error);
  }
};
