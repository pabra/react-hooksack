import { Dispatch, useEffect, useState } from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';

export default function makeStore<
  State,
  Reducer,
  ReducerAction = Reducer extends (state: State, action: infer T) => State
    ? T
    : never
>(
  initialState: State,
  reducer?: (state: State, action: ReducerAction) => State,
) {
  type NewStateFn = (oldState: State) => State;

  // keep references to all setters
  const setters: Dispatch<State>[] = [];
  let storeState: State = initialState;

  // set new state and notify all setters about it
  const setState = (
    arg: [ReducerAction] extends [never] ? State | NewStateFn : ReducerAction,
  ): void => {
    let newState;

    if (reducer instanceof Function) {
      // reducer
      newState = reducer(storeState, arg as ReducerAction);
    } else if (arg instanceof Function) {
      // state setting function
      newState = arg(storeState);
    } else {
      // new state passed
      newState = arg;
    }

    // do not do anything if state did not change
    if (newState === storeState) {
      return;
    }

    storeState = newState;
    batch(() => setters.forEach((s: Dispatch<State>) => s(storeState)));
  };

  return (): [State, typeof setState] => {
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
