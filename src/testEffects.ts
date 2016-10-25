"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");
import { Observable } from "rxjs/Observable";
import { queue } from "rxjs/scheduler/queue";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/interval";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/do";
import "rxjs/add/operator/first";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/last";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/take";
import "rxjs/add/operator/takeLast";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/toArray";
import "rxjs/add/operator/toPromise";
import { reassign, Store, Action, StoreActions, StateUpdate, startEffects } from "rxstore";
import * as deepEqual from "deep-equal";

export interface TestEffectsOptions<TState, TStore extends Store<TState>, TResult> {
  caption: string;
  prologue?: string | string[];
  store: TStore | (() => TStore);
  assess: Observable<TResult> | ((store: TStore) => Observable<TResult>);
  prepare?: Action[] | Observable<Action> | ((store: TStore) => (Action[] | Observable<Action>));
  expectations: (items: TResult[]) => void;
  timeout?: number;
  count?: number;
};

export interface TestFilterEffectsOptions<TState, TStore, TResult> {
  caption: string;
  prologue?: string | string[];
  store: TStore | (() => TStore);
  filter?: (actions: Observable<TResult>) => Observable<TResult>;
  prepare?: Action[] | Observable<Action> | ((store: TStore) => (Action[] | Observable<Action>));
  expectations: (items: TResult[]) => void;
  timeout?: number;
  count?: number;
};

const actionsToObservable = (acts: Action[] | Observable<Action>) =>
  Array.isArray(acts) ? Observable.of(...acts) : acts;

export const testEffects =
  <TState, TStore extends Store<TState>, TResult>(
    options: TestEffectsOptions<TState, TStore, TResult>
  ) => {
    const {
      caption,
      prologue = [],
      store,
      assess,
      prepare = [],
      expectations,
      timeout = 200,
      count = -1,
    } = options;

    const thePrologue = typeof prologue === "string"
      ? [prologue]
      : prologue;

    const theStore = typeof store === "function"
      ? store()
      : store;

    const assess$ = typeof assess === "function"
      ? assess(theStore)
      : assess;

    const prepare$ = typeof prepare === "function"
      ? actionsToObservable(prepare(theStore))
      : actionsToObservable(prepare);

    const timeLimited$ = timeout >= 0
      ? assess$.takeUntil(Observable.interval(timeout).first())
      : assess$;

    const countLimited$ = count > 0
      ? timeLimited$.takeLast(count)
      : timeLimited$;

    const executeTest = () => {
      it(caption,
        () => {
          startEffects(theStore.dispatch, prepare$);
          return countLimited$
            .toArray()
            .toPromise()
            .then(expectations);
        });
    };

    const describeTests = (prologueIndex: number) => {
      if (prologueIndex >= thePrologue.length) {
        executeTest();
      } else {
        describe(thePrologue[prologueIndex], () => {
          describeTests(prologueIndex + 1);
        }); //   thePrologue[prologueIndex]
      }
    };

    describeTests(0);
  };

export const testEffectsOnActions =
  <TState, TStore extends Store<TState>>(
    options: TestFilterEffectsOptions<TState, TStore, Action>
  ) => {
    const {
      caption,
      prologue,
      store,
      filter = ((a: Observable<Action>) => a),
      prepare,
      expectations,
      timeout,
      count,
    } = options;

    const assess = (s: TStore) => filter(s.action$);

    const opts: TestEffectsOptions<TState, TStore, Action> = {
      caption,
      prologue,
      store,
      assess,
      prepare,
      expectations,
      timeout,
      count,
    };

    testEffects(opts);
  };

export const testEffectsOnStates =
  <TState, TStore extends Store<TState>>(
    options: TestFilterEffectsOptions<TState, TStore, TState>
  ) => {
    const {
      caption,
      prologue,
      store,
      filter = ((a: Observable<TState>) => a),
      prepare,
      expectations,
      timeout,
      count,
    } = options;

    const assess = (s: TStore) => filter(s.state$);

    const opts: TestEffectsOptions<TState, TStore, TState> = {
      caption,
      prologue,
      store,
      assess,
      prepare,
      expectations,
      timeout,
      count,
    };

    testEffects(opts);
  };

export const testEffectsOnUpdates =
  <TState, TStore extends Store<TState>>(
    options: TestFilterEffectsOptions<TState, TStore, StateUpdate<TState>>
  ) => {
    const {
      caption,
      prologue,
      store,
      filter = ((a: Observable<StateUpdate<TState>>) => a),
      prepare,
      expectations,
      timeout,
      count,
    } = options;

    const assess = (s: TStore) => filter(s.update$);

    const opts: TestEffectsOptions<TState, TStore, StateUpdate<TState>> = {
      caption,
      prologue,
      store,
      assess,
      prepare,
      expectations,
      timeout,
      count,
    };

    testEffects(opts);
  };

export const testUpdateEffects =
  <TState, TStore extends Store<TState>>(
    givenDescription: string,
    createStore: () => TStore) => (
      whenDescription: string,
      expectationsDescription: string,
      events: Action[] | Observable<Action> |
        ((store: TStore) => (Action[] | Observable<Action>)),
      expectations: (updates: StateUpdate<TState>[]) => any,
      options?: {
        timeout?: number;
        count?: number;
      }
    ) => {
      const { timeout = 40, count = 1 } = options || {};
      describe(givenDescription, () => {
        describe(whenDescription, () => {
          it(expectationsDescription, () => {
            const store = createStore();
            const actions = typeof events === "function"
              ? actionsToObservable(events(store))
              : actionsToObservable(events);
            const promise = store.update$
              .timeout(timeout, undefined, queue)
              .catch(err => Observable.empty<StateUpdate<TState>>())
              .takeLast(count)
              .toArray()
              .toPromise() as PromiseLike<StateUpdate<TState>[]>;

            startEffects(store.dispatch, actions);
            return promise.then(expectations);
          });
        });    // Given a store 
      });    // Given a store 
    };

export const testActionEffects =
  <TState, TStore extends Store<TState>>(
    givenDescription: string,
    createStore: () => TStore) => (
      whenDescription: string,
      expectationsDescription: string,
      events: Action[] | Observable<Action> |
        ((store: TStore) => (Action[] | Observable<Action>)),
      expectations: (action: Action[]) => any,
      options?: {
        timeout?: number;
        count?: number;
      }
    ) => {
      const { timeout = 40, count = 1 } = options || {};
      describe(givenDescription, () => {
        describe(whenDescription, () => {
          it(expectationsDescription, () => {
            const store = createStore();
            const actions = typeof events === "function"
              ? actionsToObservable(events(store))
              : actionsToObservable(events);
            const promise = store.action$
              .timeout(timeout, undefined, queue)
              .catch(err => Observable.empty<Action>())
              .takeLast(count)
              .toArray()
              .toPromise() as PromiseLike<Action[]>;

            startEffects(store.dispatch, actions);
            return promise.then(expectations);
          });
        });    // Given a store 
      });    // Given a store 
    };

export const testStateEffects =
  <TState, TStore extends Store<TState>>(
    givenDescription: string,
    createStore: () => TStore) => (
      whenDescription: string,
      expectationsDescription: string,
      events: Action[] | Observable<Action> |
        ((store: TStore) => (Action[] | Observable<Action>)),
      expectations: (states: TState[]) => any,
      options?: {
        timeout?: number;
        count?: number;
      }
    ) => {
      const { timeout = 40, count = 1 } = options || {};
      describe(givenDescription, () => {
        describe(whenDescription, () => {
          it(expectationsDescription, () => {
            const store = createStore();
            const actions = typeof events === "function"
              ? actionsToObservable(events(store))
              : actionsToObservable(events);
            const promise = store.state$
              .timeout(timeout, undefined, queue)
              .catch(err => Observable.empty<TState>())
              .takeLast(count)
              .toArray()
              .toPromise() as PromiseLike<TState[]>;

            startEffects(store.dispatch, actions);
            return promise.then(expectations);
          });
        });    // Given a store 
      });    // Given a store 
    };

export const testLastStateEffects =
  <TState, TStore extends Store<TState>>(
    givenDescription: string,
    createStore: () => TStore) => (
      whenDescription: string,
      expectationsDescription: string,
      events: Action[] | Observable<Action> |
        ((store: TStore) => (Action[] | Observable<Action>)),
      expectations: (state: TState) => any,
      options?: {
        timeout?: number;
        count?: number;
      }
    ) => {
      const { timeout = 40, count = 1 } = options || {};
      describe(givenDescription, () => {
        describe(whenDescription, () => {
          it(expectationsDescription, () => {
            const store = createStore();
            const actions = typeof events === "function"
              ? actionsToObservable(events(store))
              : actionsToObservable(events);
            const promise = store.state$
              .timeout(timeout, undefined, queue)
              .catch(err => Observable.empty<TState>())
              .last()
              .toPromise() as PromiseLike<TState>;

            startEffects(store.dispatch, actions);
            return promise.then(expectations);
          });
        });    // Given a store 
      });    // Given a store 
    };

export const expectAction = (actions: Action[], action: Action) =>
  expect(actions.filter(a => a.type === action.type)).toEqual([action]);

export const expectItem = <T>(items: T[], item: T) =>
  expect(items.filter(s => deepEqual(s, item))).toEqual([item]);
