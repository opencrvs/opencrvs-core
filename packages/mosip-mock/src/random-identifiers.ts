export const createNid = async () => {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(
    "",
  );
};
