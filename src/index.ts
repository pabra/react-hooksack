import { Dispatch, useEffect, useState } from 'react';

export default function makeStore<T>(initialState: T) {
    // create the store in private
    const store: {
        setters: Array<Dispatch<T>>;
        state: T;
    } = {
        setters: [], // keep references to all setters
        state: initialState,
    };

    // set new state and notify all setters about it
    const setState = (state: T) => {
        store.state = state;
        store.setters.forEach(setter => setter(store.state));
    };

    return (): [T, (state: T) => void] => {
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
