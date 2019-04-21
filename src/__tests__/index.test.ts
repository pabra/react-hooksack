import { act, cleanup, renderHook } from 'react-hooks-testing-library';
import makeStore from '../index';

afterEach(cleanup);

test('should increment counter', () => {
    const useStore = makeStore(0);
    const { result } = renderHook(() => useStore());
    // result.current is the return value of useTestStore1().
    // So result.current[0] is the returned state where
    // result.current[1] is the corresponding setter.

    expect(result.current[0]).toBe(0);

    act(() => result.current[1](result.current[0] + 1));

    expect(result.current[0]).toBe(1);

    //
    // // should fail because of types
    // act(() => result.current[1]('one'));
});

test('should work with multiple components', () => {
    const useStore = makeStore(0);

    // two components using the same store
    const { result: result1 } = renderHook(() => useStore());
    const { result: result2 } = renderHook(() => useStore());
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

    //
    // // should fail because of types
    // act(() => result1.current[1]('one'));
    // act(() => result1.current[1]((arg: string) => 5));
    // act(() => result1.current[1]((arg: string) => '5'));
});

test('should work with reducer', () => {
    const reducer = (state: number, action: 'inc' | 'dec') => {
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
    const { result } = renderHook(() => useStore());

    expect(result.current[0]).toBe(0);

    act(() => result.current[1]('inc'));

    expect(result.current[0]).toBe(1);

    act(() => result.current[1]('dec'));

    expect(result.current[0]).toBe(0);

    //
    // // should fail because of types
    // act(() => result.current[1]('increment'));
    // act(() => result.current[1](5));
});

test('should work with payload passed to reducer', () => {
    interface ITodo {
        name: string;
        done: boolean;
    }

    const reducer = (state: ITodo[], action: { type: 'add' | 'del'; todo: ITodo }) => {
        switch (action.type) {
            case 'add':
                const newState = state.slice();
                newState.push(action.todo);
                return newState;
            case 'del':
                return state.filter(todo => todo !== action.todo);
            default:
                throw new Error();
        }
    };

    const useStore = makeStore([] as ITodo[], reducer);
    const { result } = renderHook(() => useStore());
    const todo1: ITodo = { name: 'first todo', done: false };
    const todo2: ITodo = { name: 'second todo', done: true };

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
});
