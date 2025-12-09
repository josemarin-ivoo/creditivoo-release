// reducer.js

import {deepLink, deepLinkHome} from "../actionTypes";

const initialState = {
    value: '',
};

const DeepLinkReducer = (state = initialState, action:any) => {
    switch (action.type) {
        case deepLink:
            return {
                ...state,
                value: action.payload,
            };
        case deepLinkHome:
            return {
                ...state,
                value: action.payload,
            };
        default:
            return state;
    }
};

export default DeepLinkReducer;
