const firstNames = [
  'Luna', 'Nova', 'Pixel', 'Byte', 'Echo', 'Ziggy', 'Cosmo', 'Nebula',
  'Chip', 'Dot', 'Spark', 'Glitch', 'Binary', 'Data', 'Vector', 'Cyber'
];

const surnames = [
  'Starweaver', 'Bytecraft', 'Pixelton', 'Cloudweaver', 'Datasmith',
  'Codewalker', 'Bitweaver', 'Chipmaker', 'Streamweaver', 'Netwalker'
];

export const generateRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  return { firstName, surname };
}; 