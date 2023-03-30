import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { render } from "@testing-library/react";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();

  const explore = () => {
    history.push("/")
  }

  const register = () => {
    history.push("/register");
  }
  const login = () => {
    history.push("/login");
  };

  let searchBox;

  if(!hasHiddenAuthButtons){
    searchBox = children
  }

  const logout = () => {
    // localStorage.removeItem("username");
    // localStorage.removeItem("token");
    // localStorage.removeItem("balance");
    window.localStorage.clear()
    window.location.reload();
  };
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {searchBox}
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={explore}
        >
          Back to explore
        </Button>
      ) : (localStorage.getItem("username") !== null ? (
        <Stack direction="row" spacing={2}>
          <Avatar
            src="../../public/avatar.png"
            alt={localStorage.getItem("username")}
          />

          <Button>{localStorage.getItem("username")}</Button>

          <Button role="button" variant="text" onClick={logout}>
            Logout
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button role="button" variant="text" onClick={login}>
            Login
          </Button>

          <Button role="button" variant="text" onClick={register}>
            Register
          </Button>
        </Stack>
      ))}
    </Box>
  );
};

export default Header;
