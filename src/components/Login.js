import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";
 

const Login = () => {
  //let [loggedIn, setLogin] = useState(false)
  const history = useHistory();
  if (localStorage.getItem("username") !== null) 
    history.push("/", { from: "HomePage" })
  const { enqueueSnackbar } = useSnackbar();
  let [userName, setUserName] = useState("");
  let [password, setPassword] = useState("");
  let [progress, setProgress] = useState(false);
 

  const handleChangeUsername = (event) => setUserName(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const login = async (formData) => {
    setProgress(true);
    try {
      if (
        validateInput({
          username: userName,
          password: password,
        })
      ) {
        axios
          .post(`${config.endpoint}/auth/login`, {
            username: userName,
            password: password,
          })
          .then(function (response) {
            let data = response.data;
            console.log(data.token, data.username, data.balance);
            enqueueSnackbar("Logged in successfully");
            setProgress(false);
            persistLogin(data.token, data.username, data.balance)
            history.push("/", { from: "HomePage" })
          })
          .catch((err) => {
            //console.log("err1", err.response.status)
            if (!err.response) {
              console.log("hi");
              enqueueSnackbar(
                "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
              );
              setProgress(false);
            } else if (err.response.status === 400) {
              console.log(err.response.data.message)
              enqueueSnackbar(err.response.data.message);
              setProgress(false);
            }
          });
      }
    } catch (err) {
      enqueueSnackbar(
        "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
      );
    }
    setProgress(false)
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if (data.username.length === 0) {
      enqueueSnackbar("Username is a required field");
      return false;
    } else if (data.password.length === 0) {
      enqueueSnackbar("Password is a required field");
      return false;
    }

    return true;
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    window.localStorage.setItem('username', username)
    window.localStorage.setItem('balance', balance)
    window.localStorage.setItem('token', token)
    //window.localStorage.setItem('login', JSON.stringify({balance: balance, token: token, username: username}))
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons = "true" />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Username"
            fullWidth
            onChange={handleChangeUsername}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            onChange={handlePasswordChange}
          />

          {progress ? (
            <CircularProgress style={{ alignItems: "center" }} />
          ) : (
            <Button role = "button" className="button" variant="contained" onClick={login}>
              LOGIN TO QKART
            </Button>
          )}

          <p className="secondary-action">
            Don't have an account?{" "}
            <Link role = "link" className="link" to = "/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
