import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../store/reducer';
// createStore: Creates a Redux store that holds the complete state tree of your app.
// applyMiddleware : Middleware lets you wrap the store's dispatch method.
// combineReducers : to create a single root reducer out of many.
// Redux Thunk middleware allows you to write action creators that return a function instead of an action.

const rootReducer = combineReducers({
    reducer : reducer
});

export default function configStore(initialState) {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'sandbox') {
        return createStore(rootReducer, {}, applyMiddleware(thunk), initialState);

    } else {
        return createStore(rootReducer, {}, applyMiddleware(thunk), initialState);
    }
}