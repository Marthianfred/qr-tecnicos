export const helloWorld = (): string => {
  return "Hello GDA Ciclo de Negocio!";
};


if (require.main === module) {
  console.log(helloWorld());
}
