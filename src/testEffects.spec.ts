"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");

import {
  testUpdateEffects, testStateEffects, testLastStateEffects,
  testActionEffects,
} from "./index";

describe("testUpdateEffects", () => {
  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof testUpdateEffects).toBe("function"));
  }); //    Sanity checks
}); //    testUpdateEffects

describe("testStateEffects", () => {
  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof testStateEffects).toBe("function"));
  }); //    Sanity checks
}); //    testStateEffects

describe("testLastStateEffects", () => {
  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof testLastStateEffects).toBe("function"));
  }); //    Sanity checks
}); //    testLastStateEffects

describe("testActionEffects", () => {
  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof testActionEffects).toBe("function"));
  }); //    Sanity checks
}); //    testActionEffects
