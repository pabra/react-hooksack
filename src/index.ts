import { Dispatch, useEffect, useState } from 'react';

export default function makeStore<
  TState,
  TReducer = <TA>(state: TState, action: TA) => TState
>(
  initialState: TState & Exclude<TState, (...args: any) => any>,
  reducer?: TReducer,
) {
  // type of state setting function
  type TNewStateFn = (oldState: TState) => TState;

  // type of action passed to reducer
  type TAction = TReducer extends (state: TState, action: infer TA) => TState
    ? TA
    : never;

  // type that the setState function expects as arg
  // if reducer is not passed to makeStore, TAction extends never so arg must be
  // new state or state setting function otherwise TAction is expected arg.
  type TSetStateArg = TReducer extends <TA>(state: TState, action: TA) => TState
    ? (TState | TNewStateFn)
    : TAction;

  // create the store in private
  const store: {
    setters: Array<Dispatch<TState>>;
    state: TState;
  } = {
    setters: [], // keep references to all setters
    state: initialState,
  };

  return (): [TState, (arg: TSetStateArg) => void] => {
    const [state, setter] = useState(store.state);

    // set new state and notify all setters about it
    const setState = (arg: TSetStateArg) => {
      let newState;

      if (reducer instanceof Function) {
        // reducer
        newState = reducer(store.state, arg);
      } else if (arg instanceof Function) {
        // state setting function
        newState = arg(store.state);
      } else {
        // new state passed
        newState = arg;
      }

      store.state = newState;
      store.setters.forEach((s: Dispatch<TState>) => s(store.state));
    };

    useEffect(() => {
      // keep track of new setters when component did mount
      if (!store.setters.includes(setter)) {
        store.setters.push(setter);
      }

      // returned function will run when component will unmount
      return () => {
        // remove setter from store
        const setterIdx = store.setters.indexOf(setter);
        store.setters.splice(setterIdx, 1);
      };
    }, []); // empty Array -> only run effect on mount and unmount

    return [state, setState];
  };
}
