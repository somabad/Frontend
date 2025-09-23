
// UserTableComponent.js
import React, { useState, useCallback } from 'react';
import UserTable from 'react-data-table-component';
import { Btn } from '../../../../AbstractElements';
import { tableColumns } from './UserData';
import Swal from 'sweetalert2';
import DeleteConfirmationModal from '../../common/deleteUserModal';
import axios from 'axios';

const UserTableComponent = ({ filteredData, onRefresh }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleDelete, setToggleDelete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const confirmDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire('No users selected', 'Please select at least one user to delete.', 'warning');
      return;
    }
    const idsToDelete = selectedRows.filter((user) => user.staffId);
    try {
      await Promise.all(
        idsToDelete.map((user) =>
          axios.post(`https://v21.mysutera.my/api/delete-staff/${user.staffId}/`)
        )
      );
      Swal.fire({
        title: 'Deleted!',
        text: `Deleted: ${idsToDelete.map((u) => u.name).join(', ')}`,
        icon: 'success',
      }).then(() => {
        setIsModalOpen(false);
        setSelectedRows([]);
        setToggleDelete(prev => !prev);
        onRefresh?.();
      });
    } catch (error) {
      Swal.fire('Delete failed', error?.response?.data?.detail || 'Something went wrong.', 'error');
    }
  };

  return (
    <>
      {selectedRows.length > 0 && (
        <Btn attrBtn={{ color: 'danger', onClick: () => setIsModalOpen(true) }}>Delete</Btn>
      )}
      <UserTable
        data={[...filteredData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
        columns={tableColumns(onRefresh)}
        striped
        center
        pagination
        selectableRows
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleDelete}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        userName={selectedRows.map((row) => row.name).join(', ')}
      />
    </>
  );
};

export default UserTableComponent;
