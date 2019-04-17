import { Dispatch, useEffect, useState } from 'react';

export default function makeStore<T>(initialState: T & Exclude<T, (...args: any[]) => any>) {
    type TNewStateFn = (oldState: T) => T;

    // create the store in private
    const store: {
        setters: Array<Dispatch<T>>;
        state: T;
    } = {
        setters: [], // keep references to all setters
        state: initialState,
    };

    // set new state and notify all setters about it
    const setState = (newState: T | TNewStateFn) => {
        if (newState instanceof Function) {
            store.state = newState(store.state);
        } else {
            store.state = newState;
        }
        store.setters.forEach(setter => setter(store.state));
    };

    return (): [T, (state: T | TNewStateFn) => void] => {
        const [state, setter] = useState(store.state);

        useEffect(() => {
            // keep track of new setters when component did mount
            if (!store.setters.includes(setter)) {
                store.setters.push(setter);
            }

            // returned function will run when component will unmount
            return () => {
                // remove setter from store
                const setterIdx = store.setters.indexOf(setter);
                store.setters.splice(setterIdx, 1);
            };
        }, []); // only run effect on mount and unmount

        return [state, setState];
    };
}
