import { Dispatch, useEffect, useState } from 'react';

export default function makeStore<
  TState,
  TReducer,
  TReducerAction = TReducer extends (state: TState, action: infer T) => TState // ? (T extends undefined ? never : T)
    ? Exclude<T, undefined>
    : never
>(
  initialState: TState &
    Exclude<TState, null | undefined | ((...args: any) => any)>,
  reducer?: [TReducerAction] extends [never]
    ? never
    : (state: TState, action: TReducerAction) => TState,
) {
  type TNewStateFn = (oldState: TState) => TState;

  // keep references to all setters
  const setters: Dispatch<TState>[] = [];
  let storeState: TState = initialState;

  // set new state and notify all setters about it
  const setState = (
    arg: [TReducerAction] extends [never]
      ? (TState | TNewStateFn)
      : TReducerAction,
  ): void => {
    let newState;

    if (reducer instanceof Function) {
      // reducer
      newState = reducer(storeState, arg as TReducerAction);
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
    }, [setter]); // variables that could cause a rerender

    return [state, setState];
  };
}
