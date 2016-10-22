"use strict";

import { ActionsTestConfig, ExpectedActionsDescription } from "./interfaces";

export const expectedActions = <TState>(
  nameSpace: string,
  actionConfig: (config: ActionsTestConfig<TState>) => void
): ExpectedActionsDescription<TState> => {
  let actions = [];
  const empty = (name: string, type: string) => {
    let action = { kind: "empty", name, type, samples: [] };
    actions.push(action);
    const result = {
      withSample: (source, target, caption?) => {
        action.samples.push({ source, target, caption });
        return result;
      },
    };
    return result;
  };
  const typed = (name: string, type: string) => {
    let action = { kind: "typed", name, type, samples: [] };
    actions.push(action);
    const result = {
      withSample: (source, payload, target, caption?) => {
        action.samples.push({ source, payload, target, caption });
        return result;
      },
    };
    return result;
  };
  actionConfig({ empty, typed });
  return {
    nameSpace, actions,
  };
};
