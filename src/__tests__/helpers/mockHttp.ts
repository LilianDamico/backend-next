import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

/** Cria um mock de Request do Express */
export function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: "127.0.0.1",
    method: "GET",
    originalUrl: "/test",
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

/** Cria um mock de Response do Express com encadeamento */
export function mockRes(): Response {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as Response;
}

/** Cria um mock de NextFunction */
export function mockNext(): NextFunction {
  return jest.fn() as NextFunction;
}
