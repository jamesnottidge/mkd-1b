import React, { useReducer } from "react";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();

const initialState = {
  isAuthenticated: localStorage.getItem("token") ? true : false,
  user: null,
  token: localStorage.getItem("token") ? localStorage.getItem("token") : "",
  role: localStorage.getItem("role") ? localStorage.getItem("role") : "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      //TODO
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage, navigate) => {
  const role = localStorage.getItem("role")
    ? localStorage.getItem("role")
    : "admin";
  if (errorMessage === "TOKEN_EXPIRED" || errorMessage === "UNAUTHORIZED") {
    window.location.href = "/" + role + "/login";
    dispatch({
      type: "LOGOUT",
    });
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    //TODO

    const checkToken = async () => {
      try {
        await sdk.check(localStorage.getItem("role"));
      } catch (err) {
   
        tokenExpireError(dispatch, err.message);
      }
    };
    if (localStorage.getItem("token")) {
      checkToken();
    }
  }, [dispatch, state, sdk]);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
