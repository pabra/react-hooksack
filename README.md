[![Maintainability](https://api.codeclimate.com/v1/badges/5ae9adad86505c3da9bc/maintainability)](https://codeclimate.com/github/pabra/react-hooksack/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5ae9adad86505c3da9bc/test_coverage)](https://codeclimate.com/github/pabra/react-hooksack/test_coverage)

# React HookSack

A lightweight, fully typed store for react, based entirely on hooks.

## Install

```bash
npm install --save react-hooksack
```

## Usage

### simple usage

[![Edit 487k2wzpq4](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/487k2wzpq4)

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import makeStore from 'react-hooksack';

// make a new store and set it's initial value
const useClickStore = makeStore(0);

// a simple component to view the store's state
function ClickView() {
  // as React's useState hook, our store also returns an Array of [state, setter]
  const [clicks] = useClickStore();
  return (
    <div>
      <span>clicks: {clicks}</span>
    </div>
  );
}

// another component to set a new state
function ClickButton() {
  const [clicks, setClicks] = useClickStore();
  return <button onClick={() => setClicks(clicks + 1)}>add click</button>;
}

function App() {
  return (
    <div>
      <ClickView />
      <ClickView />
      <ClickButton />
      <ClickButton />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### use with state setting function

[![Edit 3850mwqzqq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3850mwqzqq)

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import makeStore from 'react-hooksack';

// make a new store and set it's initial value
const useClickStore = makeStore(0);

// a simple component to view the store's state
function ClickView() {
  // as React's useState hook, our store also returns an Array of [state, setter]
  const [clicks] = useClickStore();
  return (
    <div>
      <span>clicks: {clicks}</span>
    </div>
  );
}

function computeClick(clicks: number) {
  // heavy computation here
  const newClicks = clicks + 1;

  return newClicks;
}

// another component to set a new state
function ClickButton() {
  const [, setClicks] = useClickStore();
  return <button onClick={() => setClicks(computeClick)}>add click</button>;
}

function App() {
  return (
    <div>
      <ClickView />
      <ClickView />
      <ClickButton />
      <ClickButton />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### use with reducer

[![Edit rmj4vyyn04](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/rmj4vyyn04)

```tsx
import React, { useRef, FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import makeStore from 'react-hooksack';

// shape a ToDo
interface ITodo {
  name: string;
  done: boolean;
}

// define the ToDo store reducer
const reducer = (
  state: ITodo[],
  action: { type: 'add' | 'del' | 'toggle'; todo: ITodo },
) => {
  switch (action.type) {
    case 'add':
      const newAddState = state.slice();
      newAddState.push(action.todo);
      return newAddState;
    case 'del':
      return state.filter(todo => todo !== action.todo);
    case 'toggle':
      const newToggleState = state.slice();
      newToggleState.forEach(todo => {
        if (todo === action.todo) {
          todo.done = !todo.done;
        }
      });
      return newToggleState;
    default:
      throw new Error();
  }
};

// make a new store, set it's initial value and pass reducer
const useTodoStore = makeStore(
  [
    { name: 'remember the milk', done: false },
    { name: 'feed the cat', done: false },
    { name: 'walk the dog', done: true },
    { name: "order a table at Luigi's", done: true },
  ] as ITodo[],
  reducer,
);

interface ITodoProps {
  todo: ITodo;
}

// component to render and toggle a Todo
const Todo: FunctionComponent<ITodoProps> = props => {
  const [, setTodos] = useTodoStore();
  const style = {
    textDecoration: props.todo.done ? 'line-through' : undefined,
  };
  const handleChange = () => {
    setTodos({ type: 'toggle', todo: props.todo });
  };

  return (
    <li>
      <input
        type="checkbox"
        checked={props.todo.done}
        onChange={handleChange}
      />
      <span style={style}>{props.todo.name}</span>
    </li>
  );
};

interface ITodoListProps {
  todos: ITodo[];
}

// component to render a list of Todos
const TodoList: FunctionComponent<ITodoListProps> = props => {
  return (
    <ul>
      {props.todos.map((todo, i) => (
        <Todo key={i} todo={todo} />
      ))}
    </ul>
  );
};

// component to tell appart already done Todos from to be tone ones
function AllTodos() {
  const [todos] = useTodoStore();
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
}

// component to add a new, undone todo
function AddTodo() {
  const [, setTodos] = useTodoStore();
  const todoInput = useRef<HTMLInputElement>(null);
  const addTodo = () => {
    if (todoInput && todoInput.current) {
      const name = todoInput.current.value;
      setTodos({ type: 'add', todo: { name, done: false } });
      todoInput.current.value = '';
    }
  };

  return (
    <div>
      <input ref={todoInput} placeholder="new Todo name" />
      <button onClick={addTodo}>add</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <AllTodos />
      <AddTodo />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## Tests

```bash
npm run test
```

## Why

I got inspired by [a bog post of Jhonny Michel](https://blog.usejournal.com/global-state-management-with-react-hooks-5e453468c5bf).
He also released [react-hookstore](https://github.com/jhonnymichel/react-hookstore) but I:

- don't like to register a new store with a string passed
- prefer functions over classes
- like Typescript / type support
