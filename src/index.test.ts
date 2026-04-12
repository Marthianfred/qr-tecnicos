import { helloWorld } from './index';

describe('helloWorld', () => {
  it('should return the correct greeting', () => {
    expect(helloWorld()).toBe("Hello GDA Ciclo de Negocio!");
  });
});
