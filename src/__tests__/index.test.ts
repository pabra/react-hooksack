import { act, cleanup, renderHook } from 'react-hooks-testing-library';
import makeStore from '../index';

afterEach(cleanup);

const useTestStore1 = makeStore(0);

test('should increment counter', () => {
    const { result } = renderHook(() => useTestStore1());
    // result.current is the return value of useTestStore1().
    // So result.current[0] is the returned state where
    // result.current[1] is the corresponding setter.

    expect(result.current[0]).toBe(0);

    act(() => result.current[1](result.current[0] + 1));

    expect(result.current[0]).toBe(1);
});

const useTestStore2 = makeStore(0);

test('should work with multiple components', () => {
    // two components using the same store
    const { result: result1 } = renderHook(() => useTestStore2());
    const { result: result2 } = renderHook(() => useTestStore2());
    const computeNewState = (oldState: number) => oldState + 1;

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
});
