// FooterCard.jsx
import React, { Fragment } from "react";
import { CardFooter } from 'reactstrap';
import { Btn } from "../../../AbstractElements";
import { Submit, Cancel } from "../../../Constant/indexmy";

const FooterCard = ({ onSubmit }) => {
  return (
    <Fragment>
      <CardFooter className="text-end">
        <Btn attrBtn={{ color: "primary", className: "m-r-15", type: "button", onClick: onSubmit }}>
          {Submit}
        </Btn>
        <Btn attrBtn={{ color: "secondary", type: "button" }}>
          {Cancel}
        </Btn>
      </CardFooter>
    </Fragment>
  );
};

export default FooterCard;
