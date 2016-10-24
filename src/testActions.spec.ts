"use strict";

import 'jest';
require("babel-core/register");
require("babel-polyfill");

import {
  testActions,
} from "./index";

describe("testActions", () => {
  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof testActions).toBe("function"));
  }); //    Sanity checks
}); //    testActions

