import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { BiTrash } from "react-icons/bi";
import EditableField from "./EditableField";
import { IoAddOutline } from "react-icons/io5";

const ProductItem = (props) => {
  const {
    onProductizedProductEdit,
    currency,
    onRowDel,
    products,
    onRowAdd,
    onItemAdd,
  } = props;

  const productTable = products.map((product) => (
    <ProductRow
      key={product.id}
      product={product}
      onDelEvent={onRowDel}
      onProductizedProductEdit={onProductizedProductEdit}
      currency={currency}
      onItemAdd={onItemAdd}
    />
  ));

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th>PRODUCTS</th>

            <th>PRICE/RATE</th>
            <th className="text-center">DELETE</th>
            <th className="text-center">ADD TO ITEM</th>
          </tr>
        </thead>
        <tbody>{productTable}</tbody>
      </Table>
      <Button className="fw-bold" onClick={onRowAdd}>
        Add Product
      </Button>
    </div>
  );
};

const ProductRow = (props) => {
  const { onItemAdd, product } = props;
  const { productId, productName, productPrice, productDescription } = product;
  const onDelEvent = () => {
    props.onDelEvent(product);
  };
  return (
    <tr>
      <td style={{ width: "100%" }}>
        <EditableField
          onChange={(evt) => {
            props.onProductizedProductEdit(evt, productId);
          }}
          cellData={{
            type: "text",
            name: "productName",
            placeholder: "Product name",
            value: productName,
            id: productId,
          }}
        />
        <EditableField
          onChange={(evt) => props.onProductizedProductEdit(evt, productId)}
          cellData={{
            type: "text",
            name: "productDescription",
            placeholder: "Product description",
            value: productDescription,
            id: productId,
          }}
        />
      </td>
      <td style={{ minWidth: "130px" }}>
        <EditableField
          onChange={(evt) => props.onProductizedProductEdit(evt, productId)}
          cellData={{
            leading: props.currency,
            type: "number",
            name: "productPrice",
            min: 1,
            step: "0.01",
            presicion: 2,
            textAlign: "text-end",
            value: productPrice,
            id: productId,
          }}
        />
      </td>
      <td className="text-center" style={{ minWidth: "50px" }}>
        <BiTrash
          onClick={onDelEvent}
          style={{ height: "33px", width: "33px", padding: "7.5px" }}
          className="text-white mt-1 btn btn-danger"
        />
      </td>
      <td className="text-center" style={{ minWidth: "100px" }}>
        <IoAddOutline
          onClick={() => {
            onItemAdd(productId);
          }}
          style={{ height: "33px", width: "33px", padding: "7.5px" }}
          className="text-white mt-1 btn btn-success"
        />
      </td>
    </tr>
  );
};

export default ProductItem;
