import React, { useState, useEffect } from "react";
import { setTokenHeader, setSaltHeader } from "../utils/api";

export const AccountContext = React.createContext();

export const AccountProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [modules, setModules] = useState([
    {
      title: "DNSIAND",
      moduleCode: "CS3219",
    },
    {
      title: "helps",
      moduleCode: "CS3235",
    },
    {
      title: "helps",
      moduleCode: "CS1231",
    },
    {
      title: "helps",
      moduleCode: "CS3342",
    },

    {
      title: "helps",
      moduleCode: "CS5555",
    },
  ]);
  const [profilePic, setProfilePic] = useState("");
  const [jwtSalt, setJwtSalt] = useState("");

  const setUser = (user, token) => {
    setToken(token);
    setUsername(user.username);
    setEmail(user.email);
    if (user.modules) {
      setModules(user.modules);
    }
    if (user.profilePic) {
      setProfilePic(user.profilePic);
    }
    setTokenHeader(token);
    setJwtSalt(user.jwtSalt);
    setSaltHeader(user.jwtSalt);
  };

  const isAuthenticated = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/user/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const loadData = async () => {
    isAuthenticated().then(async (res) => {
      const data = await res.json();
      if (res.error) {
        console.log(res.error);
      } else if (res.status == 200) {
        setUser(data.user, data.token);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateUsername = (newUsername) => {
    setUsername(newUsername); // comment this line out after api integration is done
    // await api call to update username in backend, change to async function
  };

  const handleUpdateEmail = (newEmail) => {
    setEmail(newEmail); // comment this line out after api integration is done
    // await api call to update username in backend, change to async function
  };

  const handleAddModules = (newModule) => {
    if (
      newModule !== "" &&
      !modules.find((mod) => mod.moduleCode === newModule.moduleCode)
    ) {
      setModules([...modules, newModule]);
    }
  };

  const handleDeleteModule = (modCode) => {
    setModules(modules.filter((mod) => mod.moduleCode !== modCode));
  };

  const handleUpdateSalt = (salt) => {
    setJwtSalt(salt);
    setSaltHeader(salt);
  };

  return (
    <AccountContext.Provider
      value={{
        setUser,
        token,
        username,
        setUsername,
        email,
        setEmail,
        modules,
        setModules,
        profilePic,
        setProfilePic,
        jwtSalt,
        setJwtSalt,
        handleUpdateSalt,
        handleAddModules,
        handleDeleteModule,
        handleUpdateUsername,
        handleUpdateEmail,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
