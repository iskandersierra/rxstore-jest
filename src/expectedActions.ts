"use strict";

import {
  ActionsTestConfig, ExpectedActionsDescription,
  ExpectedEmptyActionDescription, ExpectedTypedActionDescription,
  EmptyActionConfig, TypedActionConfig,
} from "./interfaces";

export const expectedActions = <TState>(
  nameSpace: string,
  actionConfig: (config: ActionsTestConfig<TState>) => void
): ExpectedActionsDescription<TState> => {
  let actions: (ExpectedEmptyActionDescription<TState> | ExpectedTypedActionDescription<TState>)[] = [];
  const empty = (name: string, type: string) => {
    let action: ExpectedEmptyActionDescription<TState> = {
      kind: "empty", name, type, samples: [],
    };
    actions.push(action);
    const result: EmptyActionConfig<TState> = {
      withSample: (source, target, caption?) => {
        action.samples!.push({ source, target, caption });
        return result;
      },
    };
    return result;
  };
  const typed = (name: string, type: string) => {
    let action: ExpectedTypedActionDescription<TState> = {
      kind: "typed", name, type, samples: [],
    };
    actions.push(action);
    const result: TypedActionConfig<TState> = {
      withSample: (source, payload, target, caption?) => {
        action.samples!.push({ source, payload, target, caption });
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
