// __mocks__/bcryptjs.ts — mock manual para testes jest
import { jest } from "@jest/globals";

const hash = jest.fn();
const compare = jest.fn();
const genSalt = jest.fn();
const hashSync = jest.fn();
const compareSync = jest.fn();

export default { hash, compare, genSalt, hashSync, compareSync };
export { hash, compare, genSalt, hashSync, compareSync };
