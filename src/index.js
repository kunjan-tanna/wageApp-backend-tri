import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/stable';
// import 'react-app-polyfill/ie11'; // For IE 11 support
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import history from './utils/history';
import store from './utils/store';
import { Router } from 'react-router';
import { Provider } from 'react-redux';

const app = (
    <Provider store={store}>
        <Router history={history}>
            {/* Use Router only if you want to use history from package */}
            {/* Always wrap your app with BrowserRouter if not used Router */}
            <App />
        </Router>
    </Provider>  
)

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
