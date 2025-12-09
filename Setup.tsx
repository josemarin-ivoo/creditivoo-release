/* eslint-disable no-cond-assign */
/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
// In App.js in a new project

import * as React from 'react';
import App from './App';
import {useEffect} from "react";
import {InteractionManager} from "react-native";

export default function Setup() {
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            console.log('All interactions done. App fully ready.');
            // You can safely do initialization here
        });

        return () => task.cancel();
    }, []);

  return <App />;
}


// const Setup = () => {
//   const handleDynamicLink = (url: any) => {
//     if (url != null) {
//       console.log('onLink', url.url);
//       // https://ivoo.page.link?id=12000007081&cartId=undefined
//       var regex = /[?&]([^=#]+)=([^&#]*)/g;
//       var params: any = {}; // Initialize an empty object to store the parameters
//       var match;

//       while ((match = regex.exec(url.url))) {
//         params[match[1]] = match[2];
//       }

//       if (url.url.includes('id')) {
//         console.log('params', params);
//         store?.dispatch(deepLinkAction(params))
//         // navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
//         //   id: params.id,
//         // });
//       }else if(url.url.includes('home')){
//         store?.dispatch(homeDeepLinkAction("home"))
//       }
//     }
//   };
// }

//   React.useEffect(() => {
//     const unsubscribe = dynamicLinks().onLink(handleDynamicLink);

//     dynamicLinks()
//       .getInitialLink()
//       .then(link => {
//         handleDynamicLink(link);
//       });
//     return () => {
//       unsubscribe();
//     };
//   }, []);
//   return <App />;
// };

//export default Setup;
