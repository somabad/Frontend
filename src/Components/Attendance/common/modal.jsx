import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Btn } from '../../../AbstractElements';
import { Close, SaveChanges } from '../../../Constant/indexmy';

const CommonModal = (props) => {
  return (
    <Modal isOpen={props.isOpen} toggle={props.toggler} size={props.size} centered>
      <ModalHeader toggle={props.toggler}>
        {props.title}
      </ModalHeader>
      <ModalBody className={props.bodyClass}>
        {props.children}
      </ModalBody>
      {props.showFooter && (
        <ModalFooter>
          <Btn attrBtn={{ color: 'secondary', onClick: props.toggler }}>{Close}</Btn>
          {props.footerButtons}
        </ModalFooter>
      )}
    </Modal>
  );
};

export default CommonModal;