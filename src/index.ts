import { Dispatch, useLayoutEffect, useState } from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';

type ReducerAction<State, Reducer> = Reducer extends (
  state: State,
  action: infer T,
) => State
  ? T
  : never;

type Reducer<State> = (state: State, action: any) => State;

type ReducerWithActionType<State, R extends Reducer<State>> = (
  state: State,
  action: ReducerAction<State, R>,
) => State;

type SetStateWithState<State> = (
  arg: State | ((oldState: State) => State),
) => void;

type SetStateWithReducer<State, R extends Reducer<State>> = (
  action: ReducerAction<State, R>,
) => void;

type JustStateOrSetter = 'justState' | 'justSetter' | undefined;

type UseStoreWithState<State> = <J extends JustStateOrSetter = undefined>(
  just?: J,
) => J extends 'justState'
  ? State
  : J extends 'justSetter'
  ? SetStateWithState<State>
  : [State, SetStateWithState<State>];

type UseStoreWithReducer<State, R extends Reducer<State>> = <
  J extends JustStateOrSetter = undefined
>(
  just?: J,
) => J extends 'justState'
  ? State
  : J extends 'justSetter'
  ? SetStateWithReducer<State, R>
  : [State, SetStateWithReducer<State, R>];

// first overload if only initial state is passed
function makeStore<State>(initialState: State): UseStoreWithState<State>;

// second overload with passed reducer
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
  const setters: Dispatch<State>[] = [];
  let storeState: State = initialState;

  // set new state and notify all state consumers about it
  const setState = (newState: State): void => {
    // do not do anything if state did not change
    if (newState === storeState) {
      return;
    }

    storeState = newState;
    batch(() => {
      const settersLength = setters.length;

      for (let i = 0; i < settersLength; i++) {
        setters[i](newState);
      }
    });
  };

  const setStateExternal =
    reducer === undefined
      ? (arg: State | ((oldState: State) => State)): void =>
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
      if (setters.indexOf(setter) === -1) {
        setters.push(setter);
      }

      // returned function will run when component will unmount
      return (): void => {
        // remove setter from store
        const setterIdx = setters.indexOf(setter);
        setters.splice(setterIdx, 1);
      };
    }, [setter, just]); // variables that could cause a rerender

    return just === 'justState'
      ? state
      : just === 'justSetter'
      ? setStateExternal
      : [state, setStateExternal];
  };
}

export default makeStore;
