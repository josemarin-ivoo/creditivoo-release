/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
import {
  FILTER_DATA,
  CLEAR_FILTER,
  SORT_DATA,
  CLEAR_SORT,
  ALLFILTER_DATA,
} from './actionTypes';
const intialState = {
  allfilters: [],
  filters: null,
  sort: {relevance: 'DESC'},
  pageSize: 200,
};

const filterReducer = (state = intialState, action) => {
  switch (action.type) {
    case ALLFILTER_DATA:
      if (state.allfilters == undefined) {
        return {
          ...state,
          allfilters: [action.payload],
        };
      } else {
        let index = state.allfilters.findIndex(
          el => el.category_id === action.payload.category_id,
        );
        if (index === -1) {
          return {
            ...state,
            allfilters: [...state.allfilters, action.payload],
          };
        } else {
          const newArray = [...state.allfilters]; //making a new array

          var expTime = new Date(newArray[index].exp_time);
          if (new Date() > expTime) {
            newArray.splice(index, 1); // current category got expired time and its deleted
            newArray.push(action.payload); // added current category with latest expiry time]

            state.allfilters.forEach(element => {
              if (new Date() > new Date(element.exp_time)) {
                const indx = newArray.indexOf(element);

                if (indx > -1) {
                  newArray.splice(indx, 1); // remove all the category data which is expired
                }
              }
            });
          }
          return {
            ...state,
            allfilters: newArray,
          };
        }
      }

    case FILTER_DATA:
      return {
        ...state,
        filters: action.payload,
      };
    case CLEAR_FILTER:
      return intialState;
    case SORT_DATA:
      return {
        ...state,
        sort: action.payload,
      };
    case CLEAR_SORT:
      return intialState;
    default:
      return state;
  }
};
export default filterReducer;
