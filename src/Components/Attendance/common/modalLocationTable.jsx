import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Btn } from '../../../AbstractElements';
import { Cancel, Yes } from '../../../Constant/indexmy';

const CommonModal = (props) => {
  return (
    <Modal isOpen={props.isOpen} toggle={props.toggler} size={props.size} centered>
      <ModalHeader toggle={props.toggler}>
        Confirm Delete
      </ModalHeader>
      <ModalBody className={props.bodyClass}>
        Are you sure you want to delete this location?
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: 'secondary', onClick: props.toggler }} >{Cancel}</Btn>
        <Btn attrBtn={{ color: 'primary', onClick: props.toggler }}>{Yes}</Btn>
      </ModalFooter>
    </Modal>
  );
};

export default CommonModal;