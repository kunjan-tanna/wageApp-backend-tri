import React from "react";
import viewUser from "./views/Users/viewUsers";

const Users = React.lazy(() => import("./views/Users/Users"));
const Offers = React.lazy(() => import("./views/Offers/offers"));
const Matches = React.lazy(() => import("./views/Matches/matches"));

const AddEditUsers = React.lazy(() => import("./views/Users/Add-Edit-Users"));
const Reports = React.lazy(() => import("./views/Reports/Reports"));
const PrivacyPolicy = React.lazy(() =>
  import("./views/PrivacyPolicy/PrivacyPolicy")
);
const Dashboard = React.lazy(() => import("./views/Dashboard/Dashboard"));
const Conversation = React.lazy(() =>
  import("./views/Conversation/conversation")
);
const OfferConversation = React.lazy(() =>
  import("./views/Conversation/offerConversation")
);
const UserConversation = React.lazy(() =>
  import("./views/Conversation/userConversation")
);
const ViewUsers = React.lazy(() => import("./views/Users/viewUsers"));
const globalSearch = React.lazy(() =>
  import("./views/globalSearch/globalSearch")
);
const AddEditOffer = React.lazy(() => import("./views/Offers/add-edit-offers"));
const Notification = React.lazy(() =>
  import("./views/Notifications/notification")
);
const BulkNotification = React.lazy(() =>
  import("./views/BulkNotification/BulkNotification")
);
const MasterReport = React.lazy(() =>
  import("./views/MasterReport/masterReport")
);
const Admins = React.lazy(() => import("./views/AdminAccounts/adminAccounts"));
const AddEditAdmin = React.lazy(() =>
  import("./views/AdminAccounts/Add-Edit-Admins")
);
const Notes = React.lazy(() => import("./views/EditedNotes/editedNotes"));
const Charts = React.lazy(() => import("./views/Charts/charts"));
const Promotion = React.lazy(() =>
  import("./views/PromotionOffers/PromotionOffers")
);
const ReportedOffers = React.lazy(() =>
  import("./views/ReportedOffers/reportedOffers")
);

let routes = [
  // { path: '/', exact: true, name: 'Home' },
  {
    path: process.env.PUBLIC_URL + "/dashboard",
    exact: true,
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: process.env.PUBLIC_URL + "/users",
    exact: true,
    name: "Users",
    component: Users,
  },
  {
    path: process.env.PUBLIC_URL + "/offers",
    exact: true,
    name: "Offers",
    component: Offers,
  },
  {
    path: process.env.PUBLIC_URL + "/matches",
    exact: true,
    name: "Matches",
    component: Matches,
  },
  {
    path: process.env.PUBLIC_URL + "/offers/add",
    exact: true,
    name: "Add Offers",
    component: AddEditOffer,
  },
  {
    path: process.env.PUBLIC_URL + "/offers/edit/:offerId",
    exact: true,
    name: "Edit Offers",
    component: AddEditOffer,
  },
  {
    path: process.env.PUBLIC_URL + "/users/add",
    exact: true,
    name: "Add User",
    component: AddEditUsers,
  },
  {
    path: process.env.PUBLIC_URL + "/users/edit/:userId",
    exact: true,
    name: "Edit User",
    component: AddEditUsers,
  },
  {
    path: process.env.PUBLIC_URL + "/viewUser/:userId",
    exact: true,
    name: "Edit User",
    component: ViewUsers,
  },
  {
    path: process.env.PUBLIC_URL + "/reports",
    exact: true,
    name: "Reports",
    component: Reports,
  },
  {
    path: process.env.PUBLIC_URL + "/conversations",
    exact: true,
    name: "Conversations",
    component: Conversation,
  },
  {
    path: process.env.PUBLIC_URL + "/offerConversation/:offerId",
    exact: true,
    name: "Offer Conversation",
    component: OfferConversation,
  },
  {
    path: process.env.PUBLIC_URL + "/userConversation/:userId",
    exact: true,
    name: "User Conversation",
    component: UserConversation,
  },
  {
    path: process.env.PUBLIC_URL + "/globalSearch",
    exact: true,
    name: "Global Search",
    component: globalSearch,
  },

  {
    path: process.env.PUBLIC_URL + "/privacy-policy",
    exact: true,
    name: "Privacy Policy",
    component: PrivacyPolicy,
  },

  {
    path: process.env.PUBLIC_URL + "/business",
    exact: true,
    name: "Business",
    component: Users,
  },
  {
    path: process.env.PUBLIC_URL + "/business/edit/:userId",
    exact: true,
    name: "Edit User",
    component: AddEditUsers,
  },
  {
    path: process.env.PUBLIC_URL + "/viewBusiness/:userId",
    exact: true,
    name: "View Business",
    component: ViewUsers,
  },

  {
    path: process.env.PUBLIC_URL + "/notification",
    exact: true,
    name: "Notification",
    component: Notification,
  },

  {
    path: process.env.PUBLIC_URL + "/bulk-notification",
    exact: true,
    name: "Bulk Notification",
    component: Notification,
  },

  {
    path: process.env.PUBLIC_URL + "/masterReport",
    exact: true,
    name: "Reports",
    component: MasterReport,
  },

  {
    path: process.env.PUBLIC_URL + "/admins",
    exact: true,
    name: "Admins",
    component: Admins,
  },
  {
    path: process.env.PUBLIC_URL + "/admins/add",
    exact: true,
    name: "Add Admin",
    component: AddEditAdmin,
  },

  // { path: process.env.PUBLIC_URL + '/notes', exact: true, name: 'Notes', component: Notes },

  {
    path: process.env.PUBLIC_URL + "/promotion-offers",
    exact: true,
    name: "Promotions",
    component: Promotion,
  },

  {
    path: process.env.PUBLIC_URL + "/charts",
    exact: true,
    name: "Notes",
    component: Charts,
  },

  {
    path: process.env.PUBLIC_URL + "/reported-offers",
    exact: true,
    name: "Reported Offers",
    component: ReportedOffers,
  },
];

export default routes;
