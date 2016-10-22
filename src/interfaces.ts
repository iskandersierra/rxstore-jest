"use strict";

export interface EmptySample<TState> {
  caption?: string;
  source: TState;
  target: TState;
}

export interface TypedSample<TState> {
  caption?: string;
  source: TState;
  target: TState;
  payload: any;
}

export interface ExpectedEmptyActionDescription<TState> {
  kind: "empty";
  name: string;
  type: string;
  samples?: EmptySample<TState>[];
}

export interface ExpectedTypedActionDescription<TState> {
  kind: "typed";
  name: string;
  type: string;
  samples?: TypedSample<TState>[];
}

export interface ExpectedActionsDescription<TState> {
  nameSpace: string;
  actions: (ExpectedEmptyActionDescription<TState> | ExpectedTypedActionDescription<TState>)[];
}

export interface EmptyActionConfig<TState> {
  withSample(source: TState, target: TState, caption?: string): EmptyActionConfig<TState>;
}

export interface TypedActionConfig<TState> {
  withSample(source: TState, payload: any, target: TState, caption?: string): TypedActionConfig<TState>;
}

export interface ActionsTestConfig<TState> {
  empty(name: string, type: string): EmptyActionConfig<TState>;
  typed(name: string, type: string): TypedActionConfig<TState>;
}
