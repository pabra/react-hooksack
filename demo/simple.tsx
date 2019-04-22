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
    <>
      <ClickView />
      <ClickButton />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
