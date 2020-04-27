import React, { useEffect, useState } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { render, waitFor, fireEvent } from '@testing-library/react';

import makeStore from '../index';

test('should increment counter', () => {
  const useStore = makeStore(0);

  //
  // // should fail because of types (be aware that __tests__ dir is excluded in tsconfig)
  // const useStore2 = makeStore();

  const { result, unmount } = renderHook(() => useStore());
  // result.current is the return value of useTestStore1().
  // So result.current[0] is the returned state where
  // result.current[1] is the corresponding setter.

  expect(result.current[0]).toBe(0);

  act(() => result.current[1](result.current[0] + 1));

  expect(result.current[0]).toBe(1);

  //
  // // should fail because of types
  // act(() => result.current[1]('one'));

  unmount();
});

test('should work with multiple components', () => {
  const useStore = makeStore(0);

  // two components using the same store
  const { result: result1, unmount: unmount1 } = renderHook(() => useStore());
  const { result: result2, unmount: unmount2 } = renderHook(() => useStore());
  const computeNewState = (oldState: number): number => oldState + 1;

  // initially, booth get a state of 0
  expect(result1.current[0]).toBe(0);
  expect(result2.current[0]).toBe(0);

  // component 1 sets new state
  act(() => result1.current[1](result1.current[0] + 1));

  // booth components should get 1 now
  expect(result1.current[0]).toBe(1);
  expect(result2.current[0]).toBe(1);

  // now component 2 sets new state by passing a function
  act(() => result2.current[1](computeNewState));

  // booth components should now get 2
  expect(result1.current[0]).toBe(2);
  expect(result2.current[0]).toBe(2);

  //
  // // should fail because of types
  // act(() => result1.current[1]('one'));
  // act(() => result1.current[1]((arg: string) => 5));
  // act(() => result1.current[1]((arg: string) => '5'));

  unmount1();
  unmount2();
});

test('should work with reducer', () => {
  const reducer = (state: number, action: 'inc' | 'dec'): number => {
    switch (action) {
      case 'inc':
        return state + 1;
      case 'dec':
        return state - 1;
      default:
        throw new Error();
    }
  };

  const useStore = makeStore(0, reducer);
  const { result, unmount } = renderHook(() => useStore());

  expect(result.current[0]).toBe(0);

  act(() => result.current[1]('inc'));

  expect(result.current[0]).toBe(1);

  act(() => result.current[1]('dec'));

  expect(result.current[0]).toBe(0);

  //
  // // should fail because of types
  // act(() => result.current[1]('increment'));
  // act(() => result.current[1](5));

  unmount();
});

test('should work with inline reducer function', () => {
  const useStore = makeStore(0, (state: number, action: 'inc' | 'dec') =>
    action === 'inc' ? state + 1 : state - 1,
  );
  const { result, unmount } = renderHook(() => useStore());

  expect(result.current[0]).toBe(0);

  act(() => result.current[1]('inc'));

  expect(result.current[0]).toBe(1);

  act(() => result.current[1]('dec'));

  expect(result.current[0]).toBe(0);

  //
  // // should fail because of types
  // act(() => result.current[1]('increment'));
  // act(() => result.current[1](5));
  // makeStore(0, (state: number, action: 'inc' | 'dec') =>
  //   action === 'inc' ? state + 1 + '' : state - 1,
  // );
  // makeStore('0', (state: number, action: 'inc' | 'dec') =>
  //   action === 'inc' ? state + 1 : state - 1,
  // );

  unmount();
});

test('should work with payload passed to reducer', () => {
  interface Todo {
    name: string;
    done: boolean;
  }

  const reducer = (
    state: Todo[],
    action: { type: 'add' | 'del'; todo: Todo },
  ): Todo[] => {
    const newState = state.slice();
    switch (action.type) {
      case 'add':
        newState.push(action.todo);
        return newState;

      case 'del':
        return state.filter(todo => todo !== action.todo);

      default:
        throw new Error();
    }
  };

  const useStore = makeStore([] as Todo[], reducer);
  const { result, unmount } = renderHook(() => useStore());
  const todo1: Todo = { name: 'first todo', done: false };
  const todo2: Todo = { name: 'second todo', done: true };

  expect(result.current[0]).toHaveLength(0);

  act(() => result.current[1]({ type: 'add', todo: todo1 }));

  expect(result.current[0]).toHaveLength(1);
  expect(result.current[0]).toEqual(expect.arrayContaining([todo1]));
  expect(result.current[0]).not.toEqual(expect.arrayContaining([todo2]));

  act(() => result.current[1]({ type: 'add', todo: todo2 }));

  expect(result.current[0]).toHaveLength(2);
  expect(result.current[0]).toEqual(expect.arrayContaining([todo2, todo1]));

  act(() => result.current[1]({ type: 'del', todo: todo1 }));

  expect(result.current[0]).toHaveLength(1);
  expect(result.current[0]).toEqual(expect.arrayContaining([todo2]));
  expect(result.current[0]).not.toEqual(expect.arrayContaining([todo1]));

  //
  // // should fail because of types
  // act(() => result.current[1]('increment'));
  // act(() => result.current[1](5));

  unmount();
});

test('state setter should be the same after usage', () => {
  const useStore = makeStore(0);
  const { result, unmount } = renderHook(() => useStore());

  const setterBefore = result.current[1];

  act(() => result.current[1](result.current[0] + 1));

  const setterAfter = result.current[1];

  expect(setterBefore).toBe(setterAfter);

  unmount();
});

test('state setter should be the same in every component', () => {
  const useStore = makeStore(0);

  // two components using the same store
  const { result: result1, unmount: unmount1 } = renderHook(() => useStore());
  const { result: result2, unmount: unmount2 } = renderHook(() => useStore());

  const computeNewState = (oldState: number): number => oldState + 1;

  expect(result1.current[1]).toBe(result2.current[1]);

  // component 1 sets new state
  act(() => result1.current[1](result1.current[0] + 1));

  // now component 2 sets new state by passing a function
  act(() => result2.current[1](computeNewState));

  expect(result1.current[1]).toBe(result2.current[1]);

  unmount1();
  unmount2();
});

test('avoid unnecessary re-rendering', async () => {
  const useClickStore = makeStore(0);
  const indicateViewRender = jest.fn();
  const indicateViewEffect = jest.fn();
  const indicateButton1Render = jest.fn();
  const indicateButton1Effect = jest.fn();
  const indicateButton2Render = jest.fn();
  const indicateButton2Effect = jest.fn();

  const ClickView: React.FC<{ recurseCount: number }> = ({ recurseCount }) => {
    const [clicks] = useClickStore();
    indicateViewRender();
    useEffect(() => indicateViewEffect());

    return (
      <div>
        <span data-testid={`render-clicks-${recurseCount}`}>
          clicks: {clicks}
        </span>
        {recurseCount <= 1 ? null : (
          <ClickView recurseCount={recurseCount - 1} />
        )}
      </div>
    );
  };

  const ClickButtonAdd: React.FC = () => {
    const [, setClicks] = useClickStore();
    indicateButton1Render();
    useEffect(() => indicateButton1Effect());

    return (
      <button
        data-testid="button-that-adds"
        onClick={(): void => {
          setTimeout(() => {
            setClicks(clicks => clicks + 1);
          }, 10);
        }}
      >
        add click
      </button>
    );
  };

  const ClickButtonReset: React.FC = () => {
    const [, setClicks] = useClickStore();
    indicateButton2Render();
    useEffect(() => indicateButton2Effect());

    return (
      <button
        data-testid="button-that-resets"
        onClick={(): void => {
          setClicks(0);
        }}
      >
        add click
      </button>
    );
  };

  const timeout = 500;
  const { container, getByTestId } = render(
    <div>
      <ClickView recurseCount={3} />
      <ClickButtonAdd />
      <ClickButtonReset />
    </div>,
  );

  // each element's renderer and effect should have been called once
  expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 0');
  expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 0');
  expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 0');
  expect(indicateViewRender).toHaveBeenCalledTimes(3);
  expect(indicateViewEffect).toHaveBeenCalledTimes(3);
  expect(indicateButton1Render).toHaveBeenCalledTimes(1);
  expect(indicateButton1Effect).toHaveBeenCalledTimes(1);
  expect(indicateButton2Render).toHaveBeenCalledTimes(1);
  expect(indicateButton2Effect).toHaveBeenCalledTimes(1);

  fireEvent.click(getByTestId('button-that-adds')); // rerender +1

  await waitFor(
    () => {
      // after incrementing the clicks, each element's renderer and effectshould
      // have been call one more time
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 1');
      expect(indicateViewRender).toHaveBeenCalledTimes(6);
      expect(indicateViewEffect).toHaveBeenCalledTimes(6);
      expect(indicateButton1Render).toHaveBeenCalledTimes(2);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(2);
      expect(indicateButton2Render).toHaveBeenCalledTimes(2);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(2);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('button-that-resets'));

  await waitFor(
    () => {
      // reset counter should couse each element to rerender
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 0');
      expect(indicateViewRender).toHaveBeenCalledTimes(9);
      expect(indicateViewEffect).toHaveBeenCalledTimes(9);
      expect(indicateButton1Render).toHaveBeenCalledTimes(3);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(3);
      expect(indicateButton2Render).toHaveBeenCalledTimes(3);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(3);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('button-that-resets'));

  await waitFor(
    () => {
      // reset again should not have caused any rerender
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 0');
      expect(indicateViewRender).toHaveBeenCalledTimes(9);
      expect(indicateViewEffect).toHaveBeenCalledTimes(9);
      expect(indicateButton1Render).toHaveBeenCalledTimes(3);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(3);
      expect(indicateButton2Render).toHaveBeenCalledTimes(3);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(3);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('button-that-adds'));

  await waitFor(
    () => {
      // adding again should cause rerender
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 1');
      expect(indicateViewRender).toHaveBeenCalledTimes(12);
      expect(indicateViewEffect).toHaveBeenCalledTimes(12);
      expect(indicateButton1Render).toHaveBeenCalledTimes(4);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(4);
      expect(indicateButton2Render).toHaveBeenCalledTimes(4);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(4);
    },
    { container, timeout },
  );
});

test('avoid unnecessary re-rendering with just setters and state consumers', async () => {
  const useClickStore = makeStore(0);
  const indicateViewRender = jest.fn();
  const indicateViewEffect = jest.fn();
  const indicateButton1Render = jest.fn();
  const indicateButton1Effect = jest.fn();
  const indicateButton2Render = jest.fn();
  const indicateButton2Effect = jest.fn();

  const ClickView: React.FC<{ recurseCount: number }> = ({ recurseCount }) => {
    const clicks = useClickStore('justState');
    indicateViewRender();
    useEffect(() => indicateViewEffect());

    return (
      <div>
        <span data-testid={`render-clicks-${recurseCount}`}>
          clicks: {clicks}
        </span>
        {recurseCount <= 1 ? null : (
          <ClickView recurseCount={recurseCount - 1} />
        )}
      </div>
    );
  };

  const ClickButtonAdd: React.FC = () => {
    const setClicks = useClickStore('justSetter');
    indicateButton1Render();
    useEffect(() => indicateButton1Effect());

    return (
      <button
        data-testid="button-that-adds"
        onClick={(): void => {
          setTimeout(() => {
            setClicks(clicks => clicks + 1);
          }, 10);
        }}
      >
        add click
      </button>
    );
  };

  const ClickButtonReset: React.FC = () => {
    const setClicks = useClickStore('justSetter');
    indicateButton2Render();
    useEffect(() => indicateButton2Effect());

    return (
      <button
        data-testid="button-that-resets"
        onClick={(): void => {
          setClicks(0);
        }}
      >
        add click
      </button>
    );
  };

  const timeout = 500;
  const { container, getByTestId } = render(
    <div>
      <ClickView recurseCount={3} />
      <ClickButtonAdd />
      <ClickButtonReset />
    </div>,
  );

  // each element's renderer and effect should have been called once
  expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 0');
  expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 0');
  expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 0');
  expect(indicateViewRender).toHaveBeenCalledTimes(3);
  expect(indicateViewEffect).toHaveBeenCalledTimes(3);
  expect(indicateButton1Render).toHaveBeenCalledTimes(1);
  expect(indicateButton1Effect).toHaveBeenCalledTimes(1);
  expect(indicateButton2Render).toHaveBeenCalledTimes(1);
  expect(indicateButton2Effect).toHaveBeenCalledTimes(1);

  fireEvent.click(getByTestId('button-that-adds')); // rerender +1

  await waitFor(
    () => {
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 1');
      // only state conumers should have rerenderd
      expect(indicateViewRender).toHaveBeenCalledTimes(6);
      expect(indicateViewEffect).toHaveBeenCalledTimes(6);
      // no rerender for just setters
      expect(indicateButton1Render).toHaveBeenCalledTimes(1);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(1);
      expect(indicateButton2Render).toHaveBeenCalledTimes(1);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(1);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('button-that-resets'));

  await waitFor(
    () => {
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 0');
      // only state conumers should have rerenderd
      expect(indicateViewRender).toHaveBeenCalledTimes(9);
      expect(indicateViewEffect).toHaveBeenCalledTimes(9);
      // no rerender for just setters
      expect(indicateButton1Render).toHaveBeenCalledTimes(1);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(1);
      expect(indicateButton2Render).toHaveBeenCalledTimes(1);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(1);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('button-that-resets'));

  await waitFor(
    () => {
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 0');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 0');
      // no rerender because state is still the same (0 === 0)
      expect(indicateViewRender).toHaveBeenCalledTimes(9);
      expect(indicateViewEffect).toHaveBeenCalledTimes(9);
      // no rerender for just setters
      expect(indicateButton1Render).toHaveBeenCalledTimes(1);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(1);
      expect(indicateButton2Render).toHaveBeenCalledTimes(1);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(1);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('button-that-adds'));

  await waitFor(
    () => {
      // adding again should cause rerender
      expect(getByTestId('render-clicks-3').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-2').textContent).toBe('clicks: 1');
      expect(getByTestId('render-clicks-1').textContent).toBe('clicks: 1');
      // only state conumers should have rerenderd
      expect(indicateViewRender).toHaveBeenCalledTimes(12);
      expect(indicateViewEffect).toHaveBeenCalledTimes(12);
      // no rerender for just setters
      expect(indicateButton1Render).toHaveBeenCalledTimes(1);
      expect(indicateButton1Effect).toHaveBeenCalledTimes(1);
      expect(indicateButton2Render).toHaveBeenCalledTimes(1);
      expect(indicateButton2Effect).toHaveBeenCalledTimes(1);
    },
    { container, timeout },
  );
});

test('update same state multiple times', async () => {
  const useStore = makeStore({ a: 1, b: 1, c: 1 });
  const indicateRenderA = jest.fn();
  const indicateRenderB = jest.fn();
  const indicateRenderC = jest.fn();
  const indicateRenderView = jest.fn();
  const indicateEffectB = jest.fn();
  const indicateEffectC = jest.fn();

  const IncA: React.FC = () => {
    const setState = useStore('justSetter');
    indicateRenderA();

    return (
      <button
        data-testid="inc-a"
        onClick={(): void => setState(s => ({ ...s, a: s.a + 1 }))}
      >
        inc a
      </button>
    );
  };

  const IncB: React.FC = () => {
    const [{ a: stateA }, setState] = useStore();
    indicateRenderB();

    useEffect(() => {
      indicateEffectB();
      setState(s => ({ ...s, b: stateA + 5 }));
    }, [setState, stateA]);

    return null;
  };

  const IncC: React.FC = () => {
    const [{ a: stateA }, setState] = useStore();
    const [localState, setLocalState] = useState(10);
    indicateRenderC();

    useEffect(() => {
      indicateEffectC();
      setState(s => ({ ...s, c: stateA + localState }));
    }, [setState, stateA, localState]);

    return (
      <button
        data-testid="inc-c"
        onClick={(): void => setLocalState(s => s + 1)}
      >
        inc {localState}
      </button>
    );
  };

  const View: React.FC<{ id: number }> = ({ id }) => {
    const { a, b, c } = useStore('justState');
    indicateRenderView();

    return (
      <span data-testid={`view-${id}`}>
        a: {a}, b: {b}, c: {c}
      </span>
    );
  };

  const timeout = 500;
  const { container, getByTestId } = render(
    <div>
      <View id={1} />
      <IncA />
      <IncB />
      <IncC />
      <View id={2} />
    </div>,
  );

  expect(getByTestId('inc-c').textContent).toBe('inc 10');
  expect(getByTestId('view-1').textContent).toBe('a: 1, b: 6, c: 11');
  expect(getByTestId('view-2').textContent).toBe('a: 1, b: 1, c: 1');
  expect(indicateRenderA).toHaveBeenCalledTimes(1);
  expect(indicateRenderB).toHaveBeenCalledTimes(2);
  expect(indicateRenderC).toHaveBeenCalledTimes(2);
  expect(indicateRenderView).toHaveBeenCalledTimes(3);
  expect(indicateEffectB).toHaveBeenCalledTimes(1);
  expect(indicateEffectC).toHaveBeenCalledTimes(1);

  fireEvent.click(getByTestId('inc-a'));

  await waitFor(
    () => {
      expect(getByTestId('inc-c').textContent).toBe('inc 10');
      expect(getByTestId('view-1').textContent).toBe('a: 2, b: 7, c: 12');
      expect(getByTestId('view-2').textContent).toBe('a: 2, b: 7, c: 12');
      expect(indicateRenderA).toHaveBeenCalledTimes(1);
      expect(indicateRenderB).toHaveBeenCalledTimes(4);
      expect(indicateRenderC).toHaveBeenCalledTimes(4);
      expect(indicateRenderView).toHaveBeenCalledTimes(7);
      expect(indicateEffectB).toHaveBeenCalledTimes(2);
      expect(indicateEffectC).toHaveBeenCalledTimes(2);
    },
    { container, timeout },
  );

  fireEvent.click(getByTestId('inc-c'));

  await waitFor(
    () => {
      expect(getByTestId('inc-c').textContent).toBe('inc 11');
      expect(getByTestId('view-1').textContent).toBe('a: 2, b: 7, c: 13');
      expect(getByTestId('view-2').textContent).toBe('a: 2, b: 7, c: 13');
      expect(indicateRenderA).toHaveBeenCalledTimes(1);
      expect(indicateRenderB).toHaveBeenCalledTimes(5);
      expect(indicateRenderC).toHaveBeenCalledTimes(6);
      expect(indicateRenderView).toHaveBeenCalledTimes(9);
      expect(indicateEffectB).toHaveBeenCalledTimes(2);
      expect(indicateEffectC).toHaveBeenCalledTimes(3);
    },
    { container, timeout },
  );
});
