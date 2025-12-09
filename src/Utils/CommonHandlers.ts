import { StackActions, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { translate } from "../locales/translate";
import { getApolloClient } from "../Queries/client";
 
import { DELETE_DATA } from "../redux/actionTypes";
import { cartDelete } from "../redux/cartAction";
 
import { ClearCHECKOUT } from "../redux/CheckoutCacheReducer/CheckoutCacheAction";
import { DELETE_DATETIMESLOT } from "../redux/DateTimeSlotReducers/DateTimeSlotAction";
import { AddressClear } from "../redux/DeliveryAddressReducers/DeliveryAddressAction";
import { DELETE_PAYMETHODS } from "../redux/PaymentMethodsReducers/PaymentMethodsAction";
import { tokenFound } from "../Services/service";
import Helper from "./Helper";
import { Routes } from "./NavigationRoutes";
import { removeStoreItem, setItemInStorage } from './Storage';
var isLogOutFound = false
const CommonHandlers = {

    CommonErrorHandler: function (error, dispatch, navigation) {
        let extn = '';
        error && error.graphQLErrors.map(({ message, locations, path, extensions }) => {
            //console.log(`[GraphQL error]: Message: ${message}, extensions: ${JSON.stringify(extensions)}`)

            switch (extensions.category) {
                case 'graphql-authorization':
                    extn = extensions.category

                    {
                        async function getClient() {
                            const client = await getApolloClient();
                            client.resetStore();
                        }
                        dispatch({ type: DELETE_DATA });
                        getClient()
                        if (isLogOutFound === false) {
                            Helper.ShowAlert(translate('home.lbl_logouttext'));
                            isLogOutFound = true

                            dispatch(cartDelete());
                            dispatch(ClearCHECKOUT());
                            dispatch(DELETE_DATETIMESLOT());
                            dispatch(DELETE_PAYMETHODS());
                            dispatch(AddressClear());

                            try {
                                removeStoreItem('CartCacheStatus_customerCart')
                                setItemInStorage('CartCacheStatus_isUpdated', '0');
                                setItemInStorage('CartCacheStatus_expTime', new Date().toString());

                            } catch (error) {
                            }
                            navigation.dispatch(StackActions.replace(Routes.APPSCREENS)) 
                        }
                    }
                    break;

                default:
                    Helper.ShowAlert(`${error}`);
                    break;
            }
        })
        return extn;
    }
}

export default CommonHandlers;