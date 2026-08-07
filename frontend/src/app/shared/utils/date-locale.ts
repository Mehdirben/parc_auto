export const dateLocaleIso = (): string => {
  const maintenant = new Date();
  const local = new Date(maintenant.getTime() - maintenant.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};
