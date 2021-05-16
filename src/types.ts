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

type StateSetter<State> = State | ((oldState: State) => State);

type SetStateWithState<State> = (arg: StateSetter<State>) => void;

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
  J extends JustStateOrSetter = undefined,
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
  StateSetter,
  UseStoreWithReducer,
  UseStoreWithState,
};
