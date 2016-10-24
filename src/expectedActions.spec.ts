"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");

import {
  ActionsTestConfig, ExpectedActionsDescription,
  expectedActions,
} from "./index";

describe("expectedActions", () => {
  describe("Sanity checks", () => {
    it("it should be a function", () =>
      expect(typeof expectedActions).toEqual("function"));
  });    // Sanity checks

  describe("Given an empty expected actions", () => {
    const expectations = expectedActions("a namespace", () => { return; });
    it("it should be non-null", () =>
      expect(typeof expectations).toBe("object"));
    it("it should be as expected", () =>
      expect(expectations).toEqual({
        nameSpace: "a namespace",
        actions: [],
      }));
  });    // Given an empty expected actions

  describe("Given an expected actions", () => {
    const expectations = expectedActions("a namespace", conf => {
      conf.empty("emptyOne", "EMPTY_ACTION")
        .withSample(1, 2, "empty caption");
      conf.typed("typedOne", "TYPED_ACTION")
        .withSample(1, "hello", 6, "typed caption");
    });
    it("it should be non-null", () =>
      expect(typeof expectations).toBe("object"));
    it("it should be as expected", () =>
      expect(expectations).toEqual({
        nameSpace: "a namespace",
        actions: [{
          kind: "empty",
          name: "emptyOne",
          type: "EMPTY_ACTION",
          samples: [{ caption: "empty caption", source: 1, target: 2 }],
        }, {
          kind: "typed",
          name: "typedOne",
          type: "TYPED_ACTION",
          samples: [{ caption: "typed caption", source: 1, payload: "hello", target: 6 }],
        }],
      }));
  });    // Given an empty expected actions
});    // expectedActions
