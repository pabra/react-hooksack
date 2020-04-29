import { useLayoutEffect, useState } from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';
import {
  JustStateOrSetter,
  Reducer,
  ReducerAction,
  ReducerWithActionType,
  SetStateWithState,
  StateSetter,
  UseStoreWithReducer,
  UseStoreWithState,
} from './types';

// first overload: without reducer
function makeStore<State>(initialState: State): UseStoreWithState<State>;

// second overload: with reducer
function makeStore<State, R extends Reducer<State>>(
  initialState: State,
  reducer: R & ReducerWithActionType<State, R>,
): UseStoreWithReducer<State, R>;

// implementation
function makeStore<State, R extends Reducer<State>>(
  initialState: State,
  reducer?: R & ReducerWithActionType<State, R>,
): UseStoreWithState<State> | UseStoreWithReducer<State, R> {
  // keep references to all setters
  const setters = new Set<SetStateWithState<State>>();
  let storeState: State = initialState;

  // set new state and notify all state consumers about it
  const setState = (newState: State): void => {
    // do not do anything if state did not change
    if (newState === storeState) {
      return;
    }

    storeState = newState;
    batch(() => {
      setters.forEach(s => s(newState));
    });
  };

  const publicStateSetter =
    reducer === undefined
      ? (arg: StateSetter<State>): void =>
          setState(arg instanceof Function ? arg(storeState) : arg)
      : (action: ReducerAction<State, R>): void =>
          setState(reducer(storeState, action));

  return <J extends JustStateOrSetter = undefined>(just?: J): any => {
    const [state, setter] = useState(storeState);

    useLayoutEffect(() => {
      // avoid rerendering of components that do not consume state
      if (just === 'justSetter') {
        return;
      }

      // keep track of new state consumers when component did mount
      setters.add(setter);

      // returned function will run when component will unmount
      return (): void => {
        // remove setter from store
        setters.delete(setter);
      };
    }, [setter, just]); // variables that could cause a rerender

    return just === 'justState'
      ? state
      : just === 'justSetter'
      ? publicStateSetter
      : [state, publicStateSetter];
  };
}

export default makeStore;
