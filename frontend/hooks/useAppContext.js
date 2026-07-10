import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
    cart: [],
    wishlist: [],
    recentlyViewed: [],
    toasts: [],
    isCartOpen: false,
    isSearchOpen: false,
    isDarkMode: false,
};

// Action types
const ACTIONS = {
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    TOGGLE_CART: 'TOGGLE_CART',
    TOGGLE_WISHLIST: 'TOGGLE_WISHLIST',
    ADD_RECENTLY_VIEWED: 'ADD_RECENTLY_VIEWED',
    ADD_TOAST: 'ADD_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
    TOGGLE_SEARCH: 'TOGGLE_SEARCH',
    TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
};

// Reducer
function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.ADD_TO_CART: {
            const existing = state.cart.find(item => item.id === action.payload.id);
            if (existing) {
                return {
                    ...state,
                    cart: state.cart.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }
            return {
                ...state,
                cart: [...state.cart, { ...action.payload, quantity: 1 }],
            };
        }

        case ACTIONS.REMOVE_FROM_CART:
            return {
                ...state,
                cart: state.cart.filter(item => item.id !== action.payload),
            };

        case ACTIONS.UPDATE_CART_QUANTITY:
            return {
                ...state,
                cart: state.cart.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                        : item
                ).filter(item => item.quantity > 0),
            };

        case ACTIONS.CLEAR_CART:
            return { ...state, cart: [] };

        case ACTIONS.TOGGLE_CART:
            return { ...state, isCartOpen: !state.isCartOpen };

        case ACTIONS.TOGGLE_WISHLIST: {
            const exists = state.wishlist.find(item => item.id === action.payload.id);
            if (exists) {
                return {
                    ...state,
                    wishlist: state.wishlist.filter(item => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                wishlist: [...state.wishlist, action.payload],
            };
        }

        case ACTIONS.ADD_RECENTLY_VIEWED: {
            const filtered = state.recentlyViewed.filter(item => item.id !== action.payload.id);
            return {
                ...state,
                recentlyViewed: [action.payload, ...filtered].slice(0, 8),
            };
        }

        case ACTIONS.ADD_TOAST:
            return {
                ...state,
                toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
            };

        case ACTIONS.REMOVE_TOAST:
            return {
                ...state,
                toasts: state.toasts.filter(t => t.id !== action.payload),
            };

        case ACTIONS.TOGGLE_SEARCH:
            return { ...state, isSearchOpen: !state.isSearchOpen };

        case ACTIONS.TOGGLE_DARK_MODE:
            return { ...state, isDarkMode: !state.isDarkMode };

        default:
            return state;
    }
}

// Provider
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
        // Load from localStorage
        if (typeof window !== 'undefined') {
            try {
                const saved = {
                    wishlist: JSON.parse(localStorage.getItem('aura_wishlist') || '[]'),
                    recentlyViewed: JSON.parse(localStorage.getItem('aura_recently_viewed') || '[]'),
                    cart: JSON.parse(localStorage.getItem('aura_cart') || '[]'),
                    isDarkMode: localStorage.getItem('aura_dark_mode') === 'true',
                };
                return { ...initial, ...saved };
            } catch (e) {
                return initial;
            }
        }
        return initial;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('aura_wishlist', JSON.stringify(state.wishlist));
    }, [state.wishlist]);

    useEffect(() => {
        localStorage.setItem('aura_recently_viewed', JSON.stringify(state.recentlyViewed));
    }, [state.recentlyViewed]);

    useEffect(() => {
        localStorage.setItem('aura_cart', JSON.stringify(state.cart));
    }, [state.cart]);

    useEffect(() => {
        localStorage.setItem('aura_dark_mode', state.isDarkMode);
        if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [state.isDarkMode]);

    // Auto-remove toasts
    useEffect(() => {
        if (state.toasts.length > 0) {
            const timer = setTimeout(() => {
                dispatch({ type: ACTIONS.REMOVE_TOAST, payload: state.toasts[0].id });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.toasts]);

    const addToCart = useCallback((product) => {
        dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
        dispatch({ type: ACTIONS.ADD_TOAST, payload: { message: 'Added to cart', type: 'success' } });
    }, []);

    const removeFromCart = useCallback((id) => {
        dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: id });
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        dispatch({ type: ACTIONS.UPDATE_CART_QUANTITY, payload: { id, quantity } });
    }, []);

    const toggleWishlist = useCallback((product) => {
        dispatch({ type: ACTIONS.TOGGLE_WISHLIST, payload: product });
        const exists = state.wishlist.find(item => item.id === product.id);
        dispatch({
            type: ACTIONS.ADD_TOAST,
            payload: {
                message: exists ? 'Removed from wishlist' : 'Added to wishlist',
                type: 'success',
            },
        });
    }, [state.wishlist]);

    const addRecentlyViewed = useCallback((product) => {
        dispatch({ type: ACTIONS.ADD_RECENTLY_VIEWED, payload: product });
    }, []);

    const toggleCart = useCallback(() => {
        dispatch({ type: ACTIONS.TOGGLE_CART });
    }, []);

    const toggleSearch = useCallback(() => {
        dispatch({ type: ACTIONS.TOGGLE_SEARCH });
    }, []);

    const toggleDarkMode = useCallback(() => {
        dispatch({ type: ACTIONS.TOGGLE_DARK_MODE });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_CART });
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        dispatch({ type: ACTIONS.ADD_TOAST, payload: { message, type } });
    }, []);

    const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <AppContext.Provider
            value={{
                ...state,
                cartTotal,
                cartCount,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleWishlist,
                addRecentlyViewed,
                toggleCart,
                toggleSearch,
                toggleDarkMode,
                clearCart,
                addToast,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}