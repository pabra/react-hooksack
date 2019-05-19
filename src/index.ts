import { Dispatch, useEffect, useState } from 'react';

export default function makeStore<TState, TReducer = undefined>(
  initialState: TState &
    Exclude<TState, null | undefined | ((...args: any) => any)>,
  reducer?: TReducer,
) {
  // type of state setting function
  type TNewStateFn = (oldState: TState) => TState;

  // type of action passed to reducer
  type TAction = TReducer extends (state: TState, action: infer TA) => TState
    ? TA
    : never;

  // type that the setState function expects as argument
  // If reducer is not passed to makeStore, it is undefined and so TState or
  // TNewStateFn is the expected argument for setState.
  // If reducer is passed (not undefined), TAction is the expected argument for
  // setSate. TAction will be never if the reducer is not of expected type. So
  // setState won't be usable.
  type TSetStateArg = TReducer extends undefined
    ? (TState | TNewStateFn)
    : TAction;

  // keep references to all setters
  const setters: Array<Dispatch<TState>> = [];
  let storeState: TState = initialState;

  // set new state and notify all setters about it
  const setState = (arg: TSetStateArg): void => {
    let newState;

    if (reducer instanceof Function) {
      // reducer
      newState = reducer(storeState, arg);
    } else if (arg instanceof Function) {
      // state setting function
      newState = arg(storeState);
    } else {
      // new state passed
      newState = arg;
    }

    storeState = newState;
    setters.forEach((s: Dispatch<TState>) => s(storeState));
  };

  return (): [TState, typeof setState] => {
    const [state, setter] = useState(storeState);

    useEffect(() => {
      // keep track of new setters when component did mount
      if (setters.indexOf(setter) === -1) {
        setters.push(setter);
      }

      // returned function will run when component will unmount
      return () => {
        // remove setter from store
        const setterIdx = setters.indexOf(setter);
        setters.splice(setterIdx, 1);
      };
    }, [setters, setter]); // variables that could cause a rerender

    return [state, setState];
  };
}
