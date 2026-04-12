export const helloWorld = (): string => {
  return "Hello GDA Ciclo de Negocio!";
};

/* istanbul ignore next */
if (require.main === module) {
  console.log(helloWorld());
}
