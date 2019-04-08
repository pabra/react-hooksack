[![Edit q7rp59klxw](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/q7rp59klxw)

React HookSack
==============

A lightweight, fully typed store for react, based entirely on hooks.


Install
-------

```bash
npm install --save react-hooksack
```


Usage
-----

```tsx
import React from "react";
import ReactDOM from "react-dom";
import makeStore from "react-hooksack";

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
    <>
      <ClickView />
      <ClickButton />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```


Tests
-----

```bash
npm run test
```


Why
---

I got inspired by [a bog post of Jhonny Michel](https://blog.usejournal.com/global-state-management-with-react-hooks-5e453468c5bf).
He also released [react-hookstore](https://github.com/jhonnymichel/react-hookstore) but I:
 * don't like to register a new store with a string passed
 * prefer functions over classes
 * like Typescript / type support
