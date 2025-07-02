export const getReferralId = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get('ref');
  
  if (refFromUrl) {
    localStorage.setItem('referralId', refFromUrl);
    return refFromUrl;
  }
  
  return localStorage.getItem('referralId');
};

export const generateReferralLink = (affiliatorId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${affiliatorId}`;
};

export const clearReferralId = (): void => {
  localStorage.removeItem('referralId');
};