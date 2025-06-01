import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Variant = {
  id: string;
  name: string;
  colors?: string[];
  sizes?: number[];
  thicknesses?: number[];
};
type Company = {
  id: string;
  name: string;
  variants: Variant[];
};
type Category = {
  id: string;
  name: string;
  companies: Company[];
};
type State = {
  categories: Category[];
};

type Action =
  | { type: 'INIT'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'ADD_COMPANY'; payload: { categoryId: string; company: Company } }
  | { type: 'ADD_VARIANT'; payload: { categoryId: string; companyId: string; variant: Variant } };

const initialState: State = { categories: [] };

function reducer(state: State, action: Action): State {
  let categories;
  switch (action.type) {
    case 'INIT':
      return { categories: action.payload };
    case 'ADD_CATEGORY':
      return { categories: [...state.categories, action.payload] };
    case 'ADD_COMPANY':
      categories = state.categories.map(cat =>
        cat.id === action.payload.categoryId
          ? { ...cat, companies: [...cat.companies, action.payload.company] }
          : cat
      );
      AsyncStorage.setItem('PRODUCTS', JSON.stringify(categories));
      return { categories };
    case 'ADD_VARIANT':
      categories = state.categories.map(cat =>
        cat.id === action.payload.categoryId
          ? {
              ...cat,
              companies: cat.companies.map(co =>
                co.id === action.payload.companyId
                  ? { ...co, variants: [...co.variants, action.payload.variant] }
                  : co
              ),
            }
          : cat
      );
      AsyncStorage.setItem('PRODUCTS', JSON.stringify(categories));
      return { categories };
    default:
      return state;
  }
}

const ProductContext = createContext<{
  state: State;
  addCategory: (cat: Category) => void;
  addCompany: (categoryId: string, co: Company) => void;
  addVariant: (categoryId: string, companyId: string, v: Variant) => void;
}>({ state: initialState, addCategory: () => {}, addCompany: () => {}, addVariant: () => {} });

export function ProductProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // initialize from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('PRODUCTS').then(data => {
      if (data) dispatch({ type: 'INIT', payload: JSON.parse(data) });
    });
  }, []);

  const addCategory = (cat: Category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: cat });
    AsyncStorage.setItem('PRODUCTS', JSON.stringify([...state.categories, cat]));
  };
  const addCompany = (categoryId: string, co: Company) => dispatch({ type: 'ADD_COMPANY', payload: { categoryId, company: co } });
  const addVariant = (categoryId: string, companyId: string, v: Variant) =>
    dispatch({ type: 'ADD_VARIANT', payload: { categoryId, companyId, variant: v } });

  return (
    <ProductContext.Provider value={{ state, addCategory, addCompany, addVariant }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  return useContext(ProductContext);
}