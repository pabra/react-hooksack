[![codecov](https://codecov.io/gh/pabra/react-hooksack/branch/master/graph/badge.svg)](https://codecov.io/gh/pabra/react-hooksack)

# React HookSack

A lightweight, fully typed store for react, based entirely on hooks.

Keep re-rendering of involved components at a minimum. See this codesandbox with
nested components. (thanks to [@andrewgreenh](https://github.com/andrewgreenh)
for creating [#3](https://github.com/pabra/react-hooksack/issues/3))

[![Edit 487k2wzpq4](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/minimum-rerender-2nvpy?file=/src/index.tsx&expanddevtools=1)

## Install

```bash
npm install --save react-hooksack
# or
yarn add react-hooksack
```

## Usage

### Import

```typescript
import makeStore from 'react-hooksack';
```

### initialize new store (hook)

```typescript
const useStore = makeStore(initialValue, reducer);
```

| object         | required | type                                                                                         | description                                                                                                                                                                                              |
| -------------- | :------: | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialValue` |   yes    | `State`                                                                                      | Whatever you pass as initial value becomes the store\`s state type (we will refer as`State`).`makeStore`is type generic, so you could set more complex types like this:`makeStore<null \| number>(null)` |
| `reducer`      |    no    | <pre>(<br>&nbsp;&nbsp;state: State,<br>&nbsp;&nbsp;action: ReducerAction<br>) => State</pre> | If passed, `setState` will only accept `ReducerAction` later.                                                                                                                                            |

### use within components

```typescript
// get state and setter
const [state, setState] = useStore();

// or just get state
const state = useStore('justState');

// or just get setter (this one avoid re-renders)
const setState = useStore('justSetter');
```

| object                  | type                                                                                                                                                          | required | description                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useStore`              | <pre>(<br>&nbsp;&nbsp;just?: 'justState' \| 'justSetter'<br>) =><br>&nbsp;&nbsp;\| [State, setState]<br>&nbsp;&nbsp;\| State<br>&nbsp;&nbsp;\| setState</pre> |          | Without arguments, `useStore` behaves like `useState` of React (except for the initial value). Otherwise you get what you asked for (see below).                                                                                                                |
| `state`                 | `State`                                                                                                                                                       |          | Will be of the type you set as `initialValue` on `makeStore`. Every component that consumes `state` will re-render whenever `state` changes.                                                                                                                    |
| `setState` (no reducer) | <pre>(<br>&nbsp;&nbsp;argument:<br>&nbsp;&nbsp;&nbsp;&nbsp;\| State<br>&nbsp;&nbsp;&nbsp;&nbsp;\| ((currentState: State) => State)<br>) => void</pre>         |          | Hooksack is using React\`s `useState` hook under the hood. Thus, you can just pass the new state of type `State` or pass a function that gets the current state and has to return the new state.                                                                |
| `setState` (reducer)    | <pre>(<br>&nbsp;&nbsp;action: ReducerAction<br>) => void</pre>                                                                                                |          | If `makeStore` was initialized with a reducer, `setState` expects that reducer\`s `ReducerAction` as argument.                                                                                                                                                  |
| `just`                  | `'justState'`                                                                                                                                                 |    no    | `useStore` will just return the current state of type `State`.                                                                                                                                                                                                  |
| `just`                  | `'justSetter'`                                                                                                                                                |    no    | `useStore` will just return the state setter `setState` depending on if you passed a reducer to `makeStore` or not (see above). Components that just get the state setter through literal `'justSetter'` **will not get re-rendered** whenever `state` changes. |

## Example

### use without reducer

[![Edit 487k2wzpq4](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/487k2wzpq4)

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import makeStore from 'react-hooksack';

// util for counting rerenders
import { LogTable, useLogStore } from './logRender';

// make a new store and set it's initial value (to 0)
const useClickStore = makeStore(0);

// a component that subscribes to the current state of "clicks"
// und uses the setter "setClicks"
const ViewAndUpdate = () => {
  // by consuming the state "clicks" this component will rerender
  // every time, "clicks" gets updated
  const [clicks, setClicks] = useClickStore();

  // just to count rerenderings
  const logRender = useLogStore('justSetter');
  React.useEffect(() => logRender('ViewAndUpdate'));

  return (
    <button
      title="ViewAndUpdate"
      onClick={() => setClicks(currentClicks => currentClicks + 1)}
    >
      add click (currently {clicks})
    </button>
  );
};

// a simple component to view the store's state
const ViewOnly = () => {
  // just subsribing to the state of "clicks" - no setter required here
  // this component will rerender with every update of "clicks" too
  const clicks = useClickStore('justState');

  // just to count rerenderings
  const logRender = useLogStore('justSetter');
  React.useEffect(() => logRender('ViewOnly'));

  return (
    <div title="ViewOnly">
      <span>clicks: {clicks}</span>
    </div>
  );
};

// a component that will only set the new state for "clicks"
const UpdateOnly = () => {
  // by just using the setter for "clicks" this component will not
  // rerender every time "clicks" updates
  const setClicks = useClickStore('justSetter');

  // just to count rerenderings
  const logRender = useLogStore('justSetter');
  React.useEffect(() => logRender('UpdateOnly'));

  return (
    <button title="UpdateOnly" onClick={() => setClicks(clicks => clicks + 1)}>
      add click
    </button>
  );
};

const App = () => (
  <div>
    <ViewOnly />
    <ViewAndUpdate />
    <UpdateOnly />
    <hr />
    <LogTable />
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

### use with reducer

[![Edit rmj4vyyn04](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rmj4vyyn04)

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import makeStore from 'react-hooksack';

// shape a ToDo
interface Todo {
  id: number;
  name: string;
  done: boolean;
}

// define the ToDo store reducer
const reducer = (
  state: Todo[],
  action: { type: 'add' | 'del' | 'toggle'; todo: Todo },
) => {
  switch (action.type) {
    case 'add':
      // ensure to always return a new object
      return [...state, action.todo];

    case 'del':
      // ensure to always return a new object
      return state.filter(todo => todo !== action.todo);

    case 'toggle':
      // ensure to always return a new object
      return state.map(todo =>
        todo === action.todo ? { ...todo, done: !todo.done } : todo,
      );

    default:
      throw new Error();
  }
};

// make a new store, set it's initial value and pass reducer
const useTodoStore = makeStore(
  [
    { id: 1, done: false, name: 'remember the milk' },
    { id: 2, done: false, name: 'feed the cat' },
    { id: 3, done: true, name: 'walk the dog' },
    { id: 4, done: true, name: "order a table at Luigi's" },
  ],
  reducer,
);

// component to render and toggle a Todo
const Todo: React.FC<{ todo: Todo }> = ({ todo }) => {
  const setTodos = useTodoStore('justSetter');
  const style = {
    textDecoration: todo.done ? 'line-through' : undefined,
  };
  const handleChange = () => {
    setTodos({ type: 'toggle', todo });
  };

  return (
    <li>
      <input type="checkbox" checked={todo.done} onChange={handleChange} />
      <span style={style}>{todo.name}</span>
    </li>
  );
};

// component to render a list of Todos
const TodoList: React.FC<{ todos: Todo[] }> = ({ todos }) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} todo={todo} />
    ))}
  </ul>
);

// component to tell appart already done Todos from to be tone ones
const AllTodos = () => {
  const todos = useTodoStore('justState');
  const toBeDone = todos.filter(todo => todo.done === false);
  const done = todos.filter(todo => todo.done);

  return (
    <div>
      {toBeDone.length > 0 && (
        <div>
          <h1>to be done</h1>
          <TodoList todos={toBeDone} />
        </div>
      )}
      {done.length > 0 && (
        <div>
          <h1>already done</h1>
          <TodoList todos={done} />
        </div>
      )}
    </div>
  );
};

// component to add a new, undone todo
const AddTodo = () => {
  const dispatchTodos = useTodoStore('justSetter');
  const todoInput = React.useRef<HTMLInputElement>(null);
  const addTodo = () => {
    if (todoInput && todoInput.current) {
      const name = todoInput.current.value;
      dispatchTodos({
        type: 'add',
        todo: { name, done: false, id: Date.now() },
      });
      todoInput.current.value = '';
    }
  };

  return (
    <div>
      <input ref={todoInput} placeholder="new Todo name" />
      <button onClick={addTodo}>add</button>
    </div>
  );
};

const App = () => (
  <div>
    <AllTodos />
    <AddTodo />
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

## Tests

```bash
npm run test
# or
npm run test:coverage
```

## Why

I got inspired by [a blog post of Jhonny Michel](https://blog.usejournal.com/global-state-management-with-react-hooks-5e453468c5bf).
He also released [react-hookstore](https://github.com/jhonnymichel/react-hookstore) but I:

- don't like to register a new store with a string passed
- prefer functions over classes
- like Typescript / type support
