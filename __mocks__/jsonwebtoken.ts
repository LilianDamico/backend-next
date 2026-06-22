// __mocks__/jsonwebtoken.ts — mock manual para testes jest
import { jest } from "@jest/globals";

const sign = jest.fn();
const verify = jest.fn();
const decode = jest.fn();

export default { sign, verify, decode };
export { sign, verify, decode };
