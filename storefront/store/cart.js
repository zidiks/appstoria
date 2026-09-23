import { persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import { toast } from 'react-toastify';

import CartPopup from '~/components/features/product/common/cart-popup';
import {pushToDataLayerForProduct} from "~/utils";

const actionTypes = {
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_CART: 'UPDATE_CART',
    REFRESH_STORE: 'REFRESH_STORE'
}

const initialState = {
    data: []
}

function cartReducer( state = initialState, action ) {
    switch ( action.type ) {
        case actionTypes.ADD_TO_CART:
            let tmpProduct = { ...action.payload.product };

            if ( state.data.findIndex( item => item.name === action.payload.product.name ) > -1 ) {
                let tmpData = state.data.reduce( ( acc, cur ) => {
                    if ( cur.name === tmpProduct.name ) {
                        acc.push( {
                            ...cur,
                            qty: parseInt( cur.qty ) + parseInt( tmpProduct.qty )
                        } );
                    } else {
                        acc.push( cur );
                    }

                    return acc;
                }, [] )

                return { ...state, data: tmpData };
            } else {
                return { ...state, data: [ ...state.data, tmpProduct ] };
            }

        case actionTypes.REMOVE_FROM_CART:
            let cart = state.data.reduce( ( cartAcc, product ) => {
                if ( product.name !== action.payload.product.name ) {
                    cartAcc.push( product );
                }
                return cartAcc;
            }, [] );

            return { ...state, data: cart };

        case actionTypes.UPDATE_CART:
            return { ...state, data: action.payload.products };

        case actionTypes.REFRESH_STORE:
            return initialState;

        default:
            return state;
    }
}

export const cartActions = {
    addToCart: product => {
        toast( <CartPopup product={ product } /> );
        pushToDataLayerForProduct('add_to_cart', product);
        return { type: actionTypes.ADD_TO_CART, payload: { product } }
    },
    removeFromCart: product => {
        pushToDataLayerForProduct('remove_from_cart', product);
        return { type: actionTypes.REMOVE_FROM_CART, payload: { product } }
    },
    updateCart: products => ( { type: actionTypes.UPDATE_CART, payload: { products } } )
};

const persistConfig = {
    keyPrefix: "riode-",
    key: "cart",
    storage
}

export default persistReducer( persistConfig, cartReducer );
