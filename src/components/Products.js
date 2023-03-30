import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import {generateCartItemsFrom} from "./Cart";
import { debounce } from "@mui/material";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loaded, isLoading] = useState(false);
  const [variable, setVar] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [debouncetime, setDebouncetime] = useState(0);
  const [cartData, setDataCart] = useState([]);
  const [product, setProduct] = useState([]);

  useEffect(() => {
    performAPICall();
    fetchCart(localStorage.getItem("token"));
  }, []);
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *h
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {
      isLoading(true);
      await axios
        .get(`${config.endpoint}/products`, {
          validateStatus: function (status) {
            return status < 400; // default
          },
        })
        .then(function (response) {
          // if(response.status === 404) console.log("yes")
          setVar(response.data);
          setProduct(response.data)
          isLoading(false);
          setProductLoading(true);
        })
        .catch((err) => {
          isLoading(false);
          if (!err.response) {
            enqueueSnackbar(
              "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
            );
            isLoading(false);
          } else if (err.response.status === 400) {
            enqueueSnackbar(err.response.data.message);
            isLoading(false);
          } else if (err.response.status === 404) {
            enqueueSnackbar(err.response.data.message);
            isLoading(false);
          }
        });
    } catch (err) {
      console.log("err");
      isLoading(false);
    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    isLoading(false);
    setProductLoading(true);
    let url;
    if (text !== "") url = `${config.endpoint}/products/search?value=${text}`;
    await axios
      .get(url)
      .then((res) => {
        console.log(res.data);
        setProduct(res.data);
        isLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          isLoading(false);
          setVar([]);
          setProductLoading(false);
        }
      });
    
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout !== 0) clearTimeout(debouncetime);
    let settime = setTimeout(() => {
      performSearch(event);
    }, debounceTimeout);
    setDebouncetime(settime);
  };

  const fetchCart = async (token) => {
    if (!token) return;
    let url = `${config.endpoint}/cart`;
    try {
      await axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setDataCart(res.data);
        });
    } catch (e) {
      if (e.response && e.status == 400) {
        enqueueSnackbar(e.response.data.message);
      } else
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
    }
  };

  const isItemInCart = (items, productId) => {
    for (let i = 0; i < items.length; i++) {
      if (productId == items[i]["productId"]) {
        enqueueSnackbar("1. Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' })
        return true
      }
    }
    return false
  }

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (token) {
      if (!isItemInCart(items, productId) || options.preventDuplicate === true) {
        let datas = {
          "productId": productId,
          "qty": qty
        }
        let url = `${config.endpoint}/cart`
        try {
          await axios.post(url, datas, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => {
            setDataCart(res.data)
          })
        } catch (e) {
          if(e.response && e.response.status == 400) return enqueueSnackbar(e.response.data.message, { variant: 'error' });
          enqueueSnackbar("2. Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' })
        }
      }
      else enqueueSnackbar("3. Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' })
    } else enqueueSnackbar("Login to add an item to the Cart", { variant: 'warning' })
    
  }

  return (
    <div>
      <Header
        children={
          <Box className="search">
            <TextField
              className="search-desktop"
              size="small"
              fullWidth
              onChange={(event) => debounceSearch(event.target.value, 500)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="Search for items/categories"
              name="search"
            />
          </Box>
        }
      >
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      {localStorage.getItem("username") !== null ? (
        <Grid container>
          <Grid item xs={12} md={9}>
            <Grid container>
              <Grid item className="product-grid">
                <Box className="hero">
                  <p className="hero-heading">
                    India's{" "}
                    <span className="hero-highlight">FASTEST DELIVERY</span> to
                    your door step
                  </p>
                </Box>
              </Grid>
            </Grid>
            {loaded ? (
              <div className="loading">
                <CircularProgress color="success" />
                <p>Loading Products</p>
              </div>
            ) : productLoading ? (
              <Grid container spacing={2} mt={2}>
                {product.map((val) => {
                  return (
                    <Grid item xs={6} md={3} key={val._id}>
                      <ProductCard product={val}  handleAddToCart = {() => addToCart(
                        localStorage.getItem("token"),
                        cartData,
                        variable,
                        val._id, 1
                        )}/>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <div className="loading">
                <SentimentDissatisfied />
                <p>No Products Found</p>
              </div>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
          <Cart products = {product} items={generateCartItemsFrom(cartData, variable)} handleQuantity = {addToCart}/>
          </Grid>
        </Grid>
      ) : (
        <div>
          <Grid container>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India's{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
          </Grid>
          {loaded ? (
            <div className="loading">
              <CircularProgress color="success" />
              <p>Loading Products</p>
            </div>
          ) : productLoading ? (
            <Grid container spacing={2} mt={2}>
              {product.map((val) => {
                return (
                  <Grid item xs={6} md={3} key={val._id}>
                    <ProductCard product={val} handleAddToCart = {() => addToCart(
                        localStorage.getItem("token"),
                        cartData,
                        variable,
                        val._id,
                        1)}/>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <div className="loading">
              <SentimentDissatisfied />
              <p>No Products Found</p>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Products;
