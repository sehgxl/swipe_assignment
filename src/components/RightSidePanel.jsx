import { useState } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";

import { useDispatch } from "react-redux";
import { updateInvoice, addInvoice } from "../redux/invoicesSlice";
import { useInvoiceListData } from "../redux/hooks";

import InvoiceModal from "./InvoiceModal";

import generateRandomId from "../utils/generateRandomId";

const RightSidePanel = (props) => {
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isCopy = location.pathname.includes("create");
  const isEdit = location.pathname.includes("edit");

  const [copyId, setCopyId] = useState("");

  const { getOneInvoice } = useInvoiceListData();

  const {
    setFormData,
    handleCalculateTotal,
    setIsOpen,
    checkValidation,
    formData,
    isOpen,
    currencyList,
    editField,
  } = props.RightSidePanelProps;

  const currenciesData = currencyList.currencyData;

  const currencyOptions = Object.keys(currenciesData).map((currency) => {
    const currencyData = currenciesData[currency];
    const currencyName = currencyData.name;
    const currencyCode = currencyData.code;
    const currencySymbol = currencyData.symbol_native;
    const optionValue = `${currencyCode}_${currencySymbol}`;
    const optionLabel = ` (${currencyCode}) ${currencyName}`;
    return <option value={optionValue}>{optionLabel}</option>;
  });

  const invoiceAddButtonText = isEdit ? "Update Invoice" : "Add Invoice";

  const invoiceModalInfo = {
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
  };

  const onCurrencyChange = (selectedOption) => {
    setFormData({ ...formData, currency: selectedOption.currency });
    handleCalculateTotal();
  };

  const closeModal = () => {
    setIsOpen(false);
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

  const handleCurrencyChange = (event) => {
    const targetValue = event.target.value;
    const [currencyCode, currencySymbol] = targetValue.split("_");

    onCurrencyChange({
      currency: {
        currencyCode,
        currencySymbol,
      },
    });
  };

  return (
    <div className="sticky-top pt-md-3 pt-xl-4">
      <Button
        variant="dark"
        onClick={handleAddInvoice}
        className="d-block w-100 mb-2"
      >
        {invoiceAddButtonText}
      </Button>
      <Button variant="primary" type="submit" className="d-block w-100">
        Review Invoice
      </Button>
      <InvoiceModal
        showModal={isOpen}
        closeModal={closeModal}
        info={invoiceModalInfo}
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
          onChange={handleCurrencyChange}
          className="btn btn-light my-1"
          aria-label="Change Currency"
          value={`${formData.currency.currencyCode}_${formData.currency.currencySymbol}`}
        >
          {currencyOptions}
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
      <Button variant="primary" onClick={handleCopyInvoice} className="d-block">
        Copy Old Invoice
      </Button>
    </div>
  );
};

export default RightSidePanel;
