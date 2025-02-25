/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";
import { http as mswHttp } from "msw";
import { createOpenApiHttp } from "./openapi-http.js";
import type { HttpMethod } from "./type-helpers.js";

const methods: HttpMethod[] = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
];

describe(createOpenApiHttp, () => {
  it("should create an http handlers object", () => {
    const http = createOpenApiHttp();

    expect(http).toBeTypeOf("object");
    for (const method of methods) {
      expect(http[method]).toBeTypeOf("function");
    }
  });

  it("should include the original MSW methods in its return type", () => {
    const http = createOpenApiHttp();

    expect(http.untyped).toBe(mswHttp);
  });
});

describe.each(methods)("openapi %s http handlers", (method) => {
  it("should forward its arguments to MSW", () => {
    const spy = vi.spyOn(mswHttp, method);
    const resolver = vi.fn();

    const http = createOpenApiHttp<any>();
    http[method]("/test", resolver, { once: false });

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith("/test", resolver, { once: false });
  });

  it("should convert openapi paths to MSW compatible paths", () => {
    const spy = vi.spyOn(mswHttp, method);
    const resolver = vi.fn();

    const http = createOpenApiHttp<any>();
    http[method]("/test/{id}", resolver);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith("/test/:id", resolver, undefined);
  });

  it("should prepend a configured baseUrl to the path for MSW", () => {
    const spy = vi.spyOn(mswHttp, method);
    const resolver = vi.fn();

    const http = createOpenApiHttp<any>({ baseUrl: "*/api/rest" });
    http[method]("/test", resolver);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith("*/api/rest/test", resolver, undefined);
  });
});
