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

export type {
  JustStateOrSetter,
  Reducer,
  ReducerAction,
  ReducerWithActionType,
  SetStateWithState,
  UseStoreWithReducer,
  UseStoreWithState,
};
