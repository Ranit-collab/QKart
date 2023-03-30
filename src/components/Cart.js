import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 *
 *
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  if (cartData.length) {
    let temp = cartData.map((item) => {
      let sam = productsData.find((product) => {
        return product._id == item.productId;
      });
      sam["qty"] = item.qty;

      return sam;
    });
    return temp;
  }
  return [];
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  return items.length
    ? items.reduce((total, item) => total + item.qty * item.cost, 0)
    : 0;
};

export const getTotalItems = (items = []) => {
  return items.length ? items.reduce((total, item) => total + item.qty, 0) : 0;
};

/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 *
 * @param {Number} value
 *    Current quantity of product in cart
 *
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 *
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 *
 *
 */
const ItemQuantity = ({ value, handleAdd, handleDelete, isReadOnly }) => {

  if (isReadOnly) {
    return (
      <Box padding="0.5rem" data-testid="item-qty">
        Qty: {value}
      </Box>
    );
  }
  else{
    return (
      <Stack direction="row" alignItems="center">
        <IconButton size="small" color="primary" onClick={handleDelete}>
          <RemoveOutlined />
        </IconButton>
        <Box padding="0.5rem" data-testid="item-qty">
          {value}
        </Box>
        <IconButton size="small" color="primary" onClick={handleAdd}>
          <AddOutlined />
        </IconButton>
      </Stack>
    );
  }
};

/**
 * Component to display the Cart view
 *
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 *
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 *
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 *
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 *
 */
const Cart = ({ products, items = [], handleQuantity, isReadOnly }) => {
  let history = useHistory();
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }
  if (!isReadOnly) {
    return (
      <>
        <Box className="cart">
          {items.map((val) => {
            return (
              <Box
                display="flex"
                alignItems="flex-start"
                padding="1rem"
                key={val["_id"]}
              >
                <Box className="image-container">
                  <img
                    // Add product image
                    src={val.image}
                    // Add product name as alt eext
                    alt={val.name}
                    width="100%"
                    height="100%"
                  />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="6rem"
                  paddingX="1rem"
                >
                  <div>{val.name}</div>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <ItemQuantity
                      // Add required props by checking implementation
                      value={val.qty}
                      handleAdd={() =>
                        handleQuantity(
                          localStorage.getItem("token"),
                          items,
                          products,
                          val["_id"],
                          val.qty + 1,
                          { preventDuplicate: true }
                        )
                      }
                      handleDelete={() =>
                        handleQuantity(
                          localStorage.getItem("token"),
                          items,
                          products,
                          val["_id"],
                          val.qty - 1,
                          { preventDuplicate: true }
                        )
                      }
                    />
                    <Box padding="0.5rem" fontWeight="700">
                      ${val.cost}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
          <Box
            padding="1rem"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box color="#3C3C3C" alignSelf="center">
              Order total
            </Box>
            <Box
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
              alignSelf="center"
              data-testid="cart-total"
            >
              ${getTotalCartValue(items)}
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={() => history.push("/checkout")}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      </>
    );
  } else {
    return (
      <>
        <Box className="cart">
          {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}

          {items.map((item) => (
            <Box
              display="flex"
              alignItems="flex-start"
              padding="1rem"
              key={item._id}
            >
              <Box className="image-container">
                <img
                  // Add product image
                  src={item.image}
                  // Add product name as alt text
                  alt={item.name}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="6rem"
                paddingX="1rem"
              >
                <div>
                  {/* Add product name */}
                  {item.name}
                </div>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <ItemQuantity
                    /**field to update quantity or a static quantity text**/
                    value={item.qty}
                    
                    isReadOnly={isReadOnly}
                  />
                  <Box padding="0.5rem" fontWeight="700">
                    ${item.cost}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

          {/* <Box  display="flex" justifyContent="space-around" alignItems="center"> */}
          <Box color="#3C3C3C" alignSelf="center">
            <Box
              padding="1rem"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box color="#3C3C3C" alignSelf="center">
                Order total
              </Box>
              <Box
                color="#3C3C3C"
                fontWeight="700"
                fontSize="1.5rem"
                alignSelf="center"
                data-testid="cart-total"
              >
                ${getTotalCartValue(items)}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="cart empty2" padding="1rem">
          <h1>Order Details</h1>
          <Box display="flex" justifyContent="space-between">
            <p>Products</p>
            <p>{getTotalItems(items)}</p>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <p>Subtotal</p>
            <p>${getTotalCartValue(items)}</p>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <p>Shipping Charges</p>
            <p>$0</p>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <h2>Total</h2>
            <h2>${getTotalCartValue(items)}</h2>
          </Box>
        </Box>
      </>
    );
  }
};

export default Cart;
