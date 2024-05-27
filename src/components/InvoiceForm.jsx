import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { BiArrowBack } from "react-icons/bi";

import generateRandomId from "../utils/generateRandomId";

import { useInvoiceListData } from "../redux/hooks";

import RightSidePanel from "./RightSidePanel";
import InvoiceContainer from "./InvoiceContainer";

import { CURRENCY_EXCHANGE_API, CURRENCY_API } from "../constants";

const InvoiceForm = () => {
  const params = useParams();
  const location = useLocation();
  const { getOneInvoice, listSize } = useInvoiceListData();

  const isCopy = location.pathname.includes("create");
  const isEdit = location.pathname.includes("edit");

  const formDataInitialState = isEdit
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
      };

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(formDataInitialState);
  const [currencyList, setCurrencyList] = useState({
    currencyExchangeData: {},
    currencyData: {},
  });
  const [validated, setValidated] = useState(false);

  const invoiceForm = useRef();

  useEffect(() => {
    getCurrencyInformation();
  }, []);

  useEffect(() => {
    handleCalculateTotal();
  }, [currencyList]);

  const getCurrencyInformation = async () => {
    try {
      const [currencyExchangeResponse, currencyResponse] = await Promise.all([
        fetch(CURRENCY_EXCHANGE_API, {
          headers: {
            apikey: process.env.REACT_APP_CURRENCY_API_KEY,
          },
        }),
        fetch(CURRENCY_API, {
          headers: {
            apikey: process.env.REACT_APP_CURRENCY_API_KEY,
          },
        }),
      ]);

      const currencyExchangeData = await currencyExchangeResponse.json();
      const currencyData = await currencyResponse.json();

      setCurrencyList((prev) => ({
        ...prev,
        currencyExchangeData: currencyExchangeData.data,
        currencyData: currencyData.data,
      }));
    } catch (error) {
      console.error("Error fetching currency information:", error);
    }
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

  const editField = (name, value) => {
    setFormData({ ...formData, [name]: value });
    handleCalculateTotal();
  };

  const openModal = (event) => {
    event.preventDefault();
    handleCalculateTotal();
    setIsOpen(true);
  };

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
          <InvoiceContainer
            InvoiceContainerProps={{
              formData,
              editField,
              setFormData,
              handleCalculateTotal,
            }}
          />
        </Col>
        <Col md={4} lg={3}>
          <RightSidePanel
            RightSidePanelProps={{
              setFormData,
              handleCalculateTotal,
              setIsOpen,
              checkValidation,
              formData,
              isOpen,
              currencyList,
              editField,
            }}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default InvoiceForm;
