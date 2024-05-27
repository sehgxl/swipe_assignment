import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import InvoiceItem from "./InvoiceItem";
import ProductItem from "./ProductItem";

import { useState } from "react";

import { useDispatch } from "react-redux";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../redux/ProductsSlice";
import { useProductsListData } from "../redux/hooks";

const InvoiceContainer = (props) => {
  const { formData, editField, setFormData, handleCalculateTotal } =
    props.InvoiceContainerProps;

  const dispatch = useDispatch();

  const { productsList } = useProductsListData();

  const [currentTab, setCurrentTab] = useState("invoice");

  const handleRowDel = (itemToDelete) => {
    const updatedItems = formData.items.filter(
      (item) => item.itemId !== itemToDelete.itemId
    );
    setFormData({ ...formData, items: updatedItems });
    handleCalculateTotal();
  };

  const handleAddEvent = () => {
    const id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    const newItem = {
      itemId: id,
      itemName: "",
      itemDescription: "",
      itemPrice: "1.00",
      itemQuantity: 1,
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    handleCalculateTotal();
  };

  const handleProductAdd = () => {
    const id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    const newProduct = {
      productId: id,
      productName: "",
      productDescription: "",
      productPrice: "1.00",
      productQuantity: 1,
    };

    dispatch(addProduct(newProduct));
    handleCalculateTotal();
  };

  const handleProductDel = (productToDelete) => {
    dispatch(deleteProduct(productToDelete.productId));
    handleCalculateTotal();
  };

  const handleProductAddToItems = (productToAddId) => {
    const product = productsList.find((product) => {
      return product.productId === productToAddId;
    });

    const { productId, productName, productDescription, productPrice } =
      product;

    let currentItems = formData.items;
    const itemIndex = currentItems.findIndex(
      (item) => item.itemId === productId
    );

    if (itemIndex >= 0) {
      const itemToUpdate = currentItems[itemIndex];
      itemToUpdate.itemQuantity = parseInt(itemToUpdate.itemQuantity) + 1;
      itemToUpdate.itemName = productName;
      itemToUpdate.itemDescription = productDescription;
      itemToUpdate.itemPrice = productPrice;

      setFormData({
        ...formData,
        items: currentItems,
      });
    } else {
      const newItem = {
        itemId: productId,
        itemName: productName,
        itemDescription: productDescription,
        itemPrice: productPrice,
        itemQuantity: 1,
      };

      setFormData({
        ...formData,
        items: [...formData.items, newItem],
      });
    }

    handleCalculateTotal();
  };

  const onItemizedItemEdit = (evt, id) => {
    const updatedItems = formData.items.map((oldItem) => {
      if (oldItem.itemId === id) {
        return { ...oldItem, [evt.target.name]: evt.target.value };
      }
      return oldItem;
    });

    setFormData({ ...formData, items: updatedItems });
    handleCalculateTotal();
  };

  const onProductizedProductEdit = (evt, id) => {
    dispatch(
      updateProduct({
        productId: id,
        updatedProduct: {
          [evt.target.name]: evt.target.value,
        },
      })
    );

    handleCalculateTotal();
  };

  return (
    <Tabs
      activeKey={currentTab}
      id="uncontrolled-tab-example"
      onSelect={(k) => setCurrentTab(k)}
      className="my-3"
    >
      <Tab eventKey="invoice" title="Invoice">
        <Card className="p-4 p-xl-5 my-3 my-xl-4">
          <div className="d-flex flex-row align-items-start justify-content-between mb-3">
            <div className="d-flex flex-column">
              <div className="d-flex flex-column">
                <div className="mb-2">
                  <span className="fw-bold">Current&nbsp;Date:&nbsp;</span>
                  <span className="current-date">{formData.currentDate}</span>
                </div>
              </div>
              <div className="d-flex flex-row align-items-center">
                <span className="fw-bold d-block me-2">Due&nbsp;Date:</span>
                <Form.Control
                  type="date"
                  value={formData.dateOfIssue}
                  name="dateOfIssue"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  style={{ maxWidth: "150px" }}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please select a due date.
                </Form.Control.Feedback>
              </div>
            </div>
            <div className="d-flex flex-row align-items-center">
              <span className="fw-bold me-2">Invoice&nbsp;Number:&nbsp;</span>
              <Form.Control
                type="number"
                value={formData.invoiceNumber}
                name="invoiceNumber"
                onChange={(e) => editField(e.target.name, e.target.value)}
                min="1"
                style={{ maxWidth: "100px" }}
                required
              />
              <Form.Control.Feedback type="invalid">
                Negative values not allowed
              </Form.Control.Feedback>
            </div>
          </div>
          <hr className="my-4" />
          <Row className="mb-5">
            <Col>
              <Form.Label className="fw-bold">Bill to:</Form.Label>
              <Form.Group>
                <Form.Control
                  placeholder="Who is this invoice to?"
                  rows={3}
                  value={formData.billTo}
                  type="text"
                  name="billTo"
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Control
                  placeholder="Email address"
                  value={formData.billToEmail}
                  type="email"
                  name="billToEmail"
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="email"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid email.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Control
                  placeholder="Billing address"
                  value={formData.billToAddress}
                  type="text"
                  name="billToAddress"
                  className="my-2"
                  autoComplete="address"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter an address.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label className="fw-bold">Bill from:</Form.Label>
                <Form.Control
                  placeholder="Who is this invoice from?"
                  rows={3}
                  value={formData.billFrom}
                  type="text"
                  name="billFrom"
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a name.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Control
                  placeholder="Email address"
                  value={formData.billFromEmail}
                  type="email"
                  name="billFromEmail"
                  className="my-2"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  autoComplete="email"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid email.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Control
                  placeholder="Billing address"
                  value={formData.billFromAddress}
                  type="text"
                  name="billFromAddress"
                  className="my-2"
                  autoComplete="address"
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter an address.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <InvoiceItem
            onItemizedItemEdit={onItemizedItemEdit}
            onRowAdd={handleAddEvent}
            onRowDel={handleRowDel}
            currency={formData.currency.currencySymbol}
            items={formData.items}
          />
          <Row className="mt-4 justify-content-end">
            <Col lg={6}>
              <div className="d-flex flex-row align-items-start justify-content-between">
                <span className="fw-bold">Subtotal:</span>
                <span>
                  {formData.currency.currencySymbol}
                  {formData.subTotal}
                </span>
              </div>
              <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                <span className="fw-bold">Discount:</span>
                <span>
                  <span className="small">({formData.discountRate || 0}%)</span>
                  {formData.currency.currencySymbol}
                  {formData.discountAmount || 0}
                </span>
              </div>
              <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                <span className="fw-bold">Tax:</span>
                <span>
                  <span className="small">({formData.taxRate || 0}%)</span>
                  {formData.currency.currencySymbol}
                  {formData.taxAmount || 0}
                </span>
              </div>
              <hr />
              <div
                className="d-flex flex-row align-items-start justify-content-between"
                style={{ fontSize: "1.125rem" }}
              >
                <span className="fw-bold">Total:</span>
                <span className="fw-bold">
                  {formData.currency.currencySymbol}
                  {formData.total || 0}
                </span>
              </div>
            </Col>
          </Row>
          <hr className="my-4" />
          <Form.Label className="fw-bold">Notes:</Form.Label>
          <Form.Control
            placeholder="Thanks for your business!"
            name="notes"
            value={formData.notes}
            onChange={(e) => editField(e.target.name, e.target.value)}
            as="textarea"
            className="my-2"
            rows={1}
          />
        </Card>
      </Tab>
      <Tab eventKey="products" title="Products">
        <Card className="p-4 p-xl-5 my-3 my-xl-4">
          <ProductItem
            onProductizedProductEdit={onProductizedProductEdit}
            onRowAdd={handleProductAdd}
            onRowDel={handleProductDel}
            onItemAdd={handleProductAddToItems}
            currency={formData.currency.currencySymbol}
            products={productsList}
          />
        </Card>
      </Tab>
    </Tabs>
  );
};

export default InvoiceContainer;
