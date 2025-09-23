import React, { useState, useContext } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ToolTip, Btn } from '../../../../AbstractElements';
import CustomizerContext from '../../../../_helper/Customizer';
import Swal from 'sweetalert2';

import ViewUserModal from '../../common/ViewUserModal';
import UpdateUserModal from '../../common/UpdateUserModal';
import ClockLogModal from '../../common/ClockLogModal';
import GenerateReport from '../../common/GenerateReportModal';
import ResetDevice from '../../common/ResetDeviceModal';
import DeleteConfirmationModal from '../../common/deleteUserModal';

const style2 = { width: 40, fontSize: 14, padding: 1 };

const ActionButtons = ({ row, onUpdateSuccess }) => {
  const [tooltipUpdate, setTooltipUpdate] = useState(false);
  const [tooltipDelete, setTooltipDelete] = useState(false);
  const [tooltipView, setTooltipView] = useState(false);
  const [tooltipMore, setTooltipMore] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const toggleViewModal = () => setViewModalOpen(!viewModalOpen);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const toggleUpdateModal = () => setUpdateModalOpen(!updateModalOpen);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const [clockLogModalOpen, setClockLogModalOpen] = useState(false);
  const toggleClockLogModal = () => setClockLogModalOpen(!clockLogModalOpen);

  const [GenerateReportModalOpen, setGenerateReportModalOpen] = useState(false);
  const toggleGenerateReportModal = () => setGenerateReportModalOpen(!GenerateReportModalOpen);

  const [ResetDeviceModalOpen, setResetDeviceModalOpen] = useState(false);
  const toggleResetDeviceModal = () => setResetDeviceModalOpen(!ResetDeviceModalOpen);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  const toggleUpdate = () => setTooltipUpdate(!tooltipUpdate);
  const toggleDelete = () => setTooltipDelete(!tooltipDelete);
  const toggleView = () => setTooltipView(!tooltipView);
  const toggleMore = () => setTooltipMore(!tooltipMore);

  const { layoutURL } = useContext(CustomizerContext);

  const handleConfirmDelete = () => {
    fetch(`https://v21.mysutera.my/api/delete-staff/${row.staffId}/`, {
      method: 'POST',
    })
      .then(async (response) => {
        if (response.ok) {
          toggleDeleteModal();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${row.name} has been successfully deleted.`,
            confirmButtonText: 'OK',
          }).then(() => {
            if (typeof onUpdateSuccess === 'function') {
              onUpdateSuccess(); // ✅ trigger parent refresh
            }
          });
        } else {
          const error = await response.json();
          Swal.fire('Error', error.message || 'Failed to delete user.', 'error');
        }
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        Swal.fire('Error', 'An error occurred while deleting the user.', 'error');
      });
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {/* View Button */}
        <Btn
          attrBtn={{
            id: `TooltipView-${row.staffId}`,
            style: style2,
            color: '#ffffff',
            className: 'btn btn-xs',
            type: 'button',
            onClick: toggleViewModal,
          }}
        >
          <i className="fa fa-eye" />
        </Btn>
        <ToolTip
          attrToolTip={{
            placement: 'bottom',
            isOpen: tooltipView,
            target: `TooltipView-${row.staffId}`,
            toggle: toggleView,
          }}
        >
          View Detail
        </ToolTip>

        {/* Update Button */}
        <Btn
          attrBtn={{
            id: `TooltipUpdate-${row.staffId}`,
            style: style2,
            color: '#ffffff',
            className: 'btn btn-xs',
            type: 'button',
            onClick: toggleUpdateModal,
          }}
        >
          <i className="fa fa-pencil" />
        </Btn>
        <ToolTip
          attrToolTip={{
            placement: 'bottom',
            isOpen: tooltipUpdate,
            target: `TooltipUpdate-${row.staffId}`,
            toggle: toggleUpdate,
          }}
        >
          Update
        </ToolTip>

        {/* Delete Button */}
        <Btn
          attrBtn={{
            id: `TooltipDelete-${row.staffId}`,
            onClick: toggleDeleteModal,
            style: style2,
            color: '#ffffff',
            className: 'btn btn-xs',
            type: 'button',
          }}
        >
          <i className="fa fa-trash-o" />
        </Btn>
        <ToolTip
          attrToolTip={{
            placement: 'bottom',
            isOpen: tooltipDelete,
            target: `TooltipDelete-${row.staffId}`,
            toggle: toggleDelete,
          }}
        >
          Delete
        </ToolTip>

        {/* More Dropdown */}
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle
            id={`TooltipMore-${row.staffId}`}
            tag="button"
            className="btn btn-xs"
            style={style2}
          >
            <i className="fa fa-ellipsis-v" />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={toggleClockLogModal}>View User Detail</DropdownItem>
            <DropdownItem onClick={toggleGenerateReportModal}>Generate Report</DropdownItem>
            <DropdownItem onClick={toggleResetDeviceModal}>Reset Device Info</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <ToolTip
          attrToolTip={{
            placement: 'bottom',
            isOpen: tooltipMore,
            target: `TooltipMore-${row.staffId}`,
            toggle: toggleMore,
          }}
        >
          More
        </ToolTip>
      </div>

      {/* Modals */}
      <ViewUserModal isOpen={viewModalOpen} toggle={toggleViewModal} user={row} />
      <UpdateUserModal
        modal={updateModalOpen}
        toggle={toggleUpdateModal}
        user={row}
        onUpdateSuccess={onUpdateSuccess} // ✅ refresh parent on update
      />
      <ClockLogModal isOpen={clockLogModalOpen} toggle={toggleClockLogModal} user={row} />
      <GenerateReport isOpen={GenerateReportModalOpen} toggle={toggleGenerateReportModal} user={row} />
      <ResetDevice isOpen={ResetDeviceModalOpen} toggle={toggleResetDeviceModal} user={row} />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        toggle={toggleDeleteModal}
        onConfirm={handleConfirmDelete}
        userName={row.name}
      />
    </>
  );
};

export default ActionButtons;




export const tableColumns = (onUpdateSuccess) => [
  {
    name: 'User ID',
    selector: row => `${row.userId}`,
    sortable: true,
    center: true,
  },
  {
    name: 'Name',
    selector: row => `${row.name}`,
    sortable: true,
    center: true,
  },
  {
    name: 'Email',
    selector: row => `${row.email}`,
    sortable: true,
    center: true,
  },
  {
    name: 'Phone',
    selector: row => `${row.phone}`,
    sortable: true,
    center: true,
  },
  {
    name: 'Role',
    selector: row => `${row.roleId.name}`,
    sortable: true,
    center: true,
  },
  {
    name: 'Action',
    cell: (row) => <ActionButtons row={row} onUpdateSuccess={onUpdateSuccess} />,
  }
];
