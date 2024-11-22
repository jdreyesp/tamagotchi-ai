export const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= 21 || hour < 9;
}; 