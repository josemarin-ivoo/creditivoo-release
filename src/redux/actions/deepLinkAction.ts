// actions.js


import {deepLink, deepLinkHome} from "../actionTypes";

export const deepLinkAction = (value: String) => ({
    type: deepLink,
    payload: value,
});

export const homeDeepLinkAction = (value: String) => ({
    type: deepLinkHome,
    payload: value,
});
