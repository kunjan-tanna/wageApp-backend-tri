import React, { Component } from 'react';
import { Route, Switch, withRouter, BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import './App.scss';
import LoaderComponent from './views/Pages/Loader/Loader';
import store from './utils/store';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Pages/Login'));
const Page404 = React.lazy(() => import('./views/Pages/Page404'));
const Page500 = React.lazy(() => import('./views/Pages/Page500'));
const ForgotPassword = React.lazy(() => import('./views/Pages/ForgotPassword/forgotPassword'));
const ResetPassword = React.lazy(() => import('./views/Pages/ResetPassword/resetPassword'));


class App extends Component {
  render() {
    var DEBUG = true;
    if (!DEBUG) {
      var methods = ["log", "debug", "warn", "info"];
      for (var i = 0; i < methods.length; i++) {
        console[methods[i]] = function () { };
      }
    }
    if (this.props.redirect_to_login) {
      store.dispatch({
        type: 'SET_REDRECT_TO_LOGIN_FALSE'
      })
      localStorage.removeItem("WAGE_AUTH_TOKEN")
      this.props.history.push(process.env.PUBLIC_URL + '/')
    }
    return (
      <BrowserRouter>
        {this.props.loading === true ? <LoaderComponent /> : null}
        <React.Suspense fallback={loading()}>
          <Switch>
            <Route exact path={process.env.PUBLIC_URL + "/login"} name="Login Page" render={props => <Login {...props} />} />
            <Route exact path={process.env.PUBLIC_URL + "/forgotPassword"} name="Forgot Password Page" render={props => <ForgotPassword {...props} />} />
            <Route exact path={process.env.PUBLIC_URL + "/resetPassword/:token"} name="Reset Password" render={props => <ResetPassword {...props} />} />
            <Route exact path={process.env.PUBLIC_URL + "/404"} name="Page 404" render={props => <Page404 {...props} />} />
            <Route exact path={process.env.PUBLIC_URL + "/500"} name="Page 500" render={props => <Page500 {...props} />} />
            <Route path={process.env.PUBLIC_URL + "/"} name="Home" render={props => <DefaultLayout {...props} />} />
          </Switch>
        </React.Suspense>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.reducer.loading,
    redirect_to_login: state.reducer.redirect_to_login
  }
}

export default withRouter(connect(mapStateToProps, null)(App));
