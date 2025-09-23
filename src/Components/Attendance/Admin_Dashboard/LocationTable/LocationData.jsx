import React, { useState } from 'react';
import { Btn, ToolTip } from '../../../../AbstractElements';
import UpdateLocationModal from '../../common/UpdateLocationModal';
import ConfirmDeleteModal from '../../common/deleteLocationModal';
import Swal from 'sweetalert2';
import axios from 'axios';

const style2 = { width: 40, fontSize: 14, padding: 1 };

const ActionButtons = ({ row, onRefresh }) => {
  const [tooltipDelete, setTooltipDelete] = useState(false);
  const [tooltipUpdate, setTooltipUpdate] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const toggleDelete = () => setTooltipDelete(!tooltipDelete);
  const toggleUpdate = () => setTooltipUpdate(!tooltipUpdate);
  const toggleModal = () => setModalOpen(!modalOpen);

  const handleDelete = async () => {
    try {
      await axios.post(`https://v21.mysutera.my/api/delete-location/${row.locationId}/`);
      setDeleteModalOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `Location "${row.name}" has been deleted.`,
      }).then(() => {
        // Refresh data after successful deletion
        if (onRefresh) {
          onRefresh();
        }
      });
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'An error occurred while deleting the location.',
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {/* Update Button */}
      <Btn
        attrBtn={{
          id: `TooltipUpdate-${row.locationId}`,
          onClick: toggleModal,
          style: style2,
          color: '#ffffff',
          className: 'btn btn-xs',
          type: 'button',
        }}
      >
        <i className="fa fa-pencil"></i>
      </Btn>
      <ToolTip
        attrToolTip={{
          placement: 'bottom',
          isOpen: tooltipUpdate,
          target: `TooltipUpdate-${row.locationId}`,
          toggle: toggleUpdate,
        }}
      >
        Update
      </ToolTip>

      {/* Delete Button */}
      <Btn
        attrBtn={{
          id: `TooltipDelete-${row.locationId}`,
          onClick: () => setDeleteModalOpen(true),
          style: style2,
          color: '#ffffff',
          className: 'btn btn-xs',
          type: 'button',
        }}
      >
        <i className="fa fa-trash-o"></i>
      </Btn>
      <ToolTip
        attrToolTip={{
          placement: 'bottom',
          isOpen: tooltipDelete,
          target: `TooltipDelete-${row.locationId}`,
          toggle: toggleDelete,
        }}
      >
        Delete
      </ToolTip>

      {/* Update Modal */}
      {modalOpen && (
        <UpdateLocationModal
          modal={modalOpen}
          toggle={toggleModal}
          locationId={row.locationId}
          location={row}
          onUpdateSuccess={onRefresh}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        locationName={row.name}
      />
    </div>
  );
};

export default ActionButtons;

// Columns definition
export const Columns = (onRefresh) => [
  {
    name: 'Location Name',
    selector: (row) => row.name,
    sortable: true,
    center: true,
  },
  {
    name: 'Location Type',
    selector: (row) => row.locationType,
    sortable: true,
    center: true,
  },
  {
    name: 'Address',
    selector: (row) => row.address,
    sortable: true,
    center: true,
  },
  {
    name: 'Start Hour',
    selector: (row) => row.start_hour,
    sortable: true,
    center: true,
  },
  {
    name: 'End Hour',
    selector: (row) => row.end_hour,
    sortable: true,
    center: true,
  },
  {
    name: 'Action',
    cell: (row) => <ActionButtons row={row} onRefresh={onRefresh} />,
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];
