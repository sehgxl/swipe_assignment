import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import InvoiceItem from "./InvoiceItem";
import InvoiceModal from "./InvoiceModal";
import { BiArrowBack } from "react-icons/bi";
import InputGroup from "react-bootstrap/InputGroup";
import { useDispatch } from "react-redux";
import { addInvoice, updateInvoice } from "../redux/invoicesSlice";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import generateRandomId from "../utils/generateRandomId";
import { useInvoiceListData, useProductsListData } from "../redux/hooks";
import ProductItem from "./ProductItem";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../redux/ProductsSlice";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

const InvoiceForm = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isCopy = location.pathname.includes("create");
  const isEdit = location.pathname.includes("edit");
  const [currentTab, setCurrentTab] = useState("invoice");

  const [isOpen, setIsOpen] = useState(false);
  const [copyId, setCopyId] = useState("");
  const { getOneInvoice, listSize } = useInvoiceListData();
  const { productsList } = useProductsListData();
  const [formData, setFormData] = useState(
    isEdit
      ? getOneInvoice(params.id)
      : isCopy && params.id
      ? {
          ...getOneInvoice(params.id),
          id: generateRandomId(),
          invoiceNumber: listSize + 1,
        }
      : {
          id: generateRandomId(),
          currentDate: new Date().toLocaleDateString(),
          invoiceNumber: listSize + 1,
          dateOfIssue: "",
          billTo: "",
          billToEmail: "",
          billToAddress: "",
          billFrom: "",
          billFromEmail: "",
          billFromAddress: "",
          notes: "",
          total: "0.00",
          subTotal: "0.00",
          taxRate: "",
          taxAmount: "0.00",
          discountRate: "",
          discountAmount: "0.00",
          currency: {
            currencyCode: "USD",
            currencySymbol: "$",
          },
          items: [],
        }
  );
  const [currencyList, setCurrencyList] = useState({
    currencyExchangeData: {},
    currencyData: {},
  });

  const getCurrencyInformation = async () => {
    const res = await Promise.all([
      fetch("https://api.freecurrencyapi.com/v1/latest?base_currency=USD", {
        headers: {
          apikey: process.env.REACT_APP_CURRENCY_API_KEY,
        },
      }),
      fetch("https://api.freecurrencyapi.com/v1/currencies", {
        headers: {
          apikey: process.env.REACT_APP_CURRENCY_API_KEY,
        },
      }),
    ]);

    const currencyExchangeData = await res[0].json();
    const currencyData = await res[1].json();

    setCurrencyList((prev) => ({
      ...prev,
      currencyExchangeData: currencyExchangeData.data,
      currencyData: currencyData.data,
    }));
  };

  useEffect(() => {
    getCurrencyInformation();
  }, []);

  const invoiceForm = useRef();
  useEffect(() => {
    handleCalculateTotal();
  }, []);

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

  const handleCalculateTotal = () => {
    setFormData((prevFormData) => {
      const selectedCurrency = prevFormData.currency.currencyCode;
      const exchangeRateData = currencyList.currencyExchangeData;
      const exchangeMultiplier = exchangeRateData[selectedCurrency] ?? 1;

      let subTotal = 0;

      prevFormData.items.forEach((item) => {
        subTotal +=
          parseFloat(item.itemPrice).toFixed(2) * parseInt(item.itemQuantity);
      });

      const taxAmount = parseFloat(
        subTotal * (prevFormData.taxRate / 100) * exchangeMultiplier
      ).toFixed(2);

      const discountAmount = parseFloat(
        subTotal * (prevFormData.discountRate / 100) * exchangeMultiplier
      ).toFixed(2);

      subTotal = (parseFloat(subTotal) * exchangeMultiplier).toFixed(2);

      const total = (
        subTotal -
        parseFloat(discountAmount) +
        parseFloat(taxAmount)
      ).toFixed(2);

      return {
        ...prevFormData,
        subTotal,
        taxAmount,
        discountAmount,
        total,
      };
    });
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

  const editField = (name, value) => {
    setFormData({ ...formData, [name]: value });
    handleCalculateTotal();
  };

  const onCurrencyChange = (selectedOption) => {
    setFormData({ ...formData, currency: selectedOption.currency });
    handleCalculateTotal();
  };

  const openModal = (event) => {
    event.preventDefault();
    handleCalculateTotal();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const [validated, setValidated] = useState(false);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (checkValidation()) {
      openModal(event);
    }
  };

  const checkValidation = () => {
    const form = invoiceForm.current;
    if (form.checkValidity() === false) {
      setValidated(true);
      return false;
    }

    setValidated(false);
    return true;
  };

  const handleAddInvoice = () => {
    if (!checkValidation()) {
      return;
    }
    if (isEdit) {
      dispatch(updateInvoice({ id: params.id, updatedInvoice: formData }));
      alert("Invoice updated successfuly 🥳");
    } else if (isCopy) {
      dispatch(addInvoice({ id: generateRandomId(), ...formData }));
      alert("Invoice added successfuly 🥳");
    } else {
      dispatch(addInvoice(formData));
      alert("Invoice added successfuly 🥳");
    }
    navigate("/");
  };

  const handleCopyInvoice = () => {
    const recievedInvoice = getOneInvoice(copyId);
    if (recievedInvoice) {
      setFormData({
        ...recievedInvoice,
        id: formData.id,
        invoiceNumber: formData.invoiceNumber,
      });
    } else {
      alert("Invoice does not exists!!!!!");
    }
  };

  return (
    <Form
      ref={invoiceForm}
      noValidate
      validated={validated}
      onSubmit={handleFormSubmit}
    >
      <div className="d-flex align-items-center">
        <BiArrowBack size={18} />
        <div className="fw-bold mt-1 mx-2 cursor-pointer">
          <Link to="/">
            <h5>Go Back</h5>
          </Link>
        </div>
      </div>

      <Row>
        <Col md={8} lg={9}>
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
                        <span className="fw-bold">
                          Current&nbsp;Date:&nbsp;
                        </span>
                        <span className="current-date">
                          {formData.currentDate}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-row align-items-center">
                      <span className="fw-bold d-block me-2">
                        Due&nbsp;Date:
                      </span>
                      <Form.Control
                        type="date"
                        value={formData.dateOfIssue}
                        name="dateOfIssue"
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
                        style={{ maxWidth: "150px" }}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a due date.
                      </Form.Control.Feedback>
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center">
                    <span className="fw-bold me-2">
                      Invoice&nbsp;Number:&nbsp;
                    </span>
                    <Form.Control
                      type="number"
                      value={formData.invoiceNumber}
                      name="invoiceNumber"
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      min="1"
                      style={{ maxWidth: "70px" }}
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
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
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
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
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
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
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
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
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
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
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
                        onChange={(e) =>
                          editField(e.target.name, e.target.value)
                        }
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
                        <span className="small">
                          ({formData.discountRate || 0}%)
                        </span>
                        {formData.currency.currencySymbol}
                        {formData.discountAmount || 0}
                      </span>
                    </div>
                    <div className="d-flex flex-row align-items-start justify-content-between mt-2">
                      <span className="fw-bold">Tax:</span>
                      <span>
                        <span className="small">
                          ({formData.taxRate || 0}%)
                        </span>
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
        </Col>
        <Col md={4} lg={3}>
          <div className="sticky-top pt-md-3 pt-xl-4">
            <Button
              variant="dark"
              onClick={handleAddInvoice}
              className="d-block w-100 mb-2"
            >
              {isEdit ? "Update Invoice" : "Add Invoice"}
            </Button>
            <Button variant="primary" type="submit" className="d-block w-100">
              Review Invoice
            </Button>
            <InvoiceModal
              showModal={isOpen}
              closeModal={closeModal}
              info={{
                isOpen,
                id: formData.id,
                currency: formData.currency.currencySymbol,
                currentDate: formData.currentDate,
                invoiceNumber: formData.invoiceNumber,
                dateOfIssue: formData.dateOfIssue,
                billTo: formData.billTo,
                billToEmail: formData.billToEmail,
                billToAddress: formData.billToAddress,
                billFrom: formData.billFrom,
                billFromEmail: formData.billFromEmail,
                billFromAddress: formData.billFromAddress,
                notes: formData.notes,
                total: formData.total,
                subTotal: formData.subTotal,
                taxRate: formData.taxRate,
                taxAmount: formData.taxAmount,
                discountRate: formData.discountRate,
                discountAmount: formData.discountAmount,
              }}
              items={formData.items}
              currency={formData.currency.currencySymbol}
              subTotal={formData.subTotal}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
              total={formData.total}
            />
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Currency:</Form.Label>
              <Form.Select
                onChange={(event) => {
                  const targetValue = event.target.value;
                  const [currencyCode, currencySymbol] = targetValue.split("_");

                  onCurrencyChange({
                    currency: {
                      currencyCode,
                      currencySymbol,
                    },
                  });
                }}
                className="btn btn-light my-1"
                aria-label="Change Currency"
                value={`${formData.currency.currencyCode}_${formData.currency.currencySymbol}`}
              >
                {Object.keys(currencyList.currencyData).map((currency) => {
                  const currencyData = currencyList.currencyData[currency];
                  const currencyName = currencyData.name;
                  const currencyCode = currencyData.code;
                  const currencySymbol = currencyData.symbol_native;
                  const optionValue = `${currencyCode}_${currencySymbol}`;
                  const optionLabel = ` (${currencyCode}) ${currencyName}`;
                  return <option value={optionValue}>{optionLabel}</option>;
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group className="my-3">
              <Form.Label className="fw-bold">Tax rate:</Form.Label>
              <InputGroup className="my-1 flex-nowrap">
                <Form.Control
                  name="taxRate"
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  className="bg-white border"
                  placeholder="0.0"
                  min="0.00"
                  step="0.01"
                  max="100.00"
                />
                <InputGroup.Text className="bg-light fw-bold text-secondary small">
                  %
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="my-3">
              <Form.Label className="fw-bold">Discount rate:</Form.Label>
              <InputGroup className="my-1 flex-nowrap">
                <Form.Control
                  name="discountRate"
                  type="number"
                  value={formData.discountRate}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  className="bg-white border"
                  placeholder="0.0"
                  min="0.00"
                  step="0.01"
                  max="100.00"
                />
                <InputGroup.Text className="bg-light fw-bold text-secondary small">
                  %
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Control
              placeholder="Enter Invoice ID"
              name="copyId"
              value={copyId}
              onChange={(e) => setCopyId(e.target.value)}
              type="text"
              className="my-2 bg-white border"
            />
            <Button
              variant="primary"
              onClick={handleCopyInvoice}
              className="d-block"
            >
              Copy Old Invoice
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default InvoiceForm;
