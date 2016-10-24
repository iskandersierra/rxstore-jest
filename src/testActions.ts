"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");

import { ActionDescriptionMapping } from "rxstore";
import { ActionsTestConfig, ExpectedActionsDescription } from "./interfaces";

export const testActions = <TState>(
  current: ActionDescriptionMapping<TState>,
  description: string,
  expected: ExpectedActionsDescription<TState>
) => {
  describe(description, () => {
    describe("Sanity checks", () => {
      it("it should be an Object",
        () => expect(typeof current).toBe("object"));
    }); //    Sanity checks

    expected.actions.forEach(expectedAction => {
      const currentAction = current[expectedAction.name];
      describe(`Action ${expectedAction.name}`, () => {
        it(`it should be defined`,
          () => expect(currentAction).not.toBeUndefined());
        it(`it's kind should be ${expectedAction.kind}`,
          () => expect(currentAction.kind).toBe(expectedAction.kind));
        it(`it's type should be ${expectedAction.type}`,
          () => expect(currentAction.type).toBe(expected.nameSpace + expectedAction.type));
        it(`it's create should be a function`,
          () => expect(typeof currentAction.create).toBe("function"));
        if (currentAction.kind === "empty") {
          it(`it's create should create expected action`,
            () => expect(currentAction.create()).toEqual({ type: currentAction.type }));
        } else {
          it(`it's create should create expected action`,
            () => expect(currentAction.create("some value"))
              .toEqual({ type: currentAction.type, payload: "some value" }));
        }
        it(`it's dispatchOn should be a function`,
          () => expect(typeof currentAction.dispatchOn).toBe("function"));
        if (currentAction.kind === "empty") {
          it(`it's dispatchOn should dispatch expected action`,
            () => {
              const dispatch = jest.fn();
              currentAction.dispatchOn(dispatch);
              expect(dispatch).toBeCalledWith({ type: currentAction.type });
            });
        } else {
          it(`it's dispatchOn should dispatch expected action`,
            () => {
              const dispatch = jest.fn();
              currentAction.dispatchOn("some value", dispatch);
              expect(dispatch).toBeCalledWith({ type: currentAction.type, payload: "some value" });
            });
        }

        if (expectedAction.samples && expectedAction.samples.length > 0) {
          it("it's reducer should be a function",
            () => expect(typeof currentAction.reducer).toBe("function"));
          if (currentAction.reducer) {
            if (expectedAction.kind === "empty" && currentAction.kind === "empty") {
              expectedAction.samples!.forEach((sample, index) => {
                const caption = sample.caption || `#${index + 1}`;
                it(`it's reducer should reduce correctly sample ${caption}`,
                  () => {
                    const result = currentAction.reducer!(sample.source);
                    expect(result).toEqual(sample.target);
                  });
              });
            } else if (expectedAction.kind === "typed" && currentAction.kind === "typed") {
              expectedAction.samples!.forEach((sample, index) => {
                const caption = sample.caption || `#${index + 1}`;
                it(`it's reducer should reduce correctly sample ${caption}`,
                  () => {
                    const result = currentAction.reducer!(sample.source, sample.payload);
                    expect(result).toEqual(sample.target);
                  });
              });
            }
          }
        } else {
          it("it's reducer shouldn't be defined",
            () => expect(currentAction.reducer).toBeUndefined());
        }
      });
    }); //    Action ...

    describe("There shouldn't be unexpected actions", () => {
      Object.keys(current).forEach(name => {
        const filtered = (expected.actions
          .filter(a => a.name === name));
        const expectedAction = filtered.length >= 1 ? filtered[0] : undefined;
        if (!expectedAction) {
          it(`action ${name} should not be defined`,
            () => expect(expectedAction).not.toBeUndefined());
        }
      });
    }); //    There shouldn't be unexpected actions
  }); //    LoginEvents
};
