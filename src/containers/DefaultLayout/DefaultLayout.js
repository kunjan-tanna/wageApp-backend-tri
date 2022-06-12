import React, { Suspense } from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';
import { decrypt } from '../../utils/common'

import {
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  // AppSidebarMinimizer,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';

import { logOut, confirmBox } from '../../utils/common';


const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends React.Component {
  componentDidMount() {
    if (localStorage.getItem('WAGE')) {
      let adminData = localStorage.getItem('WAGE');
      adminData = decrypt(adminData)
      adminData = JSON.parse(adminData)
      console.log('AFDMIN', adminData)
      if (adminData.type != 100) {
        delete navigation.items[navigation.items.length - 1]
      }
    }
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  signOut = async () => {
    // e.preventDefault()
    // logOut(this.props)
    let data = await confirmBox('Logout', 'Are you sure you want to logout?');
    if (data === 1) {
      logOut();
    }
  }
  render() {
    if (!localStorage.getItem('WAGE_AUTH_TOKEN')) {
      return <Redirect to={process.env.PUBLIC_URL + '/login'} />
    } else {
      return (
        <div className="app">
          <AppHeader fixed>
            <Suspense fallback={this.loading()}>
              <DefaultHeader onLogout={() => this.signOut()} />
            </Suspense>
          </AppHeader>
          <div className="app-body">
            <AppSidebar fixed display="lg">
              <AppSidebarHeader />
              <AppSidebarForm />
              <Suspense>
                <AppSidebarNav navConfig={navigation} router={router} />
              </Suspense>
              <AppSidebarFooter />
              {/* <AppSidebarMinimizer /> */}
            </AppSidebar>
            <main className="main">
              {/* <AppBreadcrumb appRoutes={routes} router={router} /> */}
              <Container fluid className={window.location.href.includes('/offerConversation') || window.location.href.includes('/userConversation') ? "main-container" : "main-container"}>
                <Suspense fallback={this.loading()}>
                  <Switch>
                    {routes.map((route, idx) => {
                      return route.component ? (
                        <Route
                          key={idx}
                          path={route.path}
                          exact={route.exact}
                          name={route.name}
                          render={props => (
                            <route.component {...props} />
                          )} />
                      ) : (null);
                    })}
                    <Redirect from={process.env.PUBLIC_URL + "/"} to={process.env.PUBLIC_URL + "/dashboard"} />
                  </Switch>
                </Suspense>
              </Container>
            </main>
          </div>
          <AppFooter>
            <Suspense fallback={this.loading()}>
              <DefaultFooter />
            </Suspense>
          </AppFooter>
        </div>
      );
    }








  }


}

const mapStateToProps = state => {
  return {
    admin: state.reducer.admin
  }
}
export default withRouter(connect(mapStateToProps, null)(DefaultLayout));

// export default withRouter(DefaultLayout);
