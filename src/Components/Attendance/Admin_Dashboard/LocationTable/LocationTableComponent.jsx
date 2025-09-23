import React, { Fragment, useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Btn } from '../../../../AbstractElements';
import { Columns } from './LocationData';
import { getLocationList } from '../../utils';
import axios from 'axios';
import ConfirmDeleteModal from '../../common/deleteLocationModal';
import Swal from 'sweetalert2';

const LocationTableComponent = ({ searchText }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleDelete, setToggleDelete] = useState(false);
  const [data, setData] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchData = () => {
    getLocationList()
      .then((res) => {
        const mappedData = res.data.map((item) => ({
          ...item,
          locationId: item.location_id ?? item.locationId,
          name: item.location_name ?? item.name,
        }));
        setData(mappedData);
      })
      .catch((error) => {
        console.error('Error fetching location data:', error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const searchLower = debouncedSearch.toLowerCase();
    const name = item.name?.toLowerCase() || '';
    const type = item.locationType?.toLowerCase() || '';
    const address = item.address?.toLowerCase() || '';
    return (
      name.includes(searchLower) ||
      type.includes(searchLower) ||
      address.includes(searchLower)
    );
  });

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const handleDelete = () => {
    const names = selectedRows.map((r) => r.name).join(', ');
    setSelectedNames(names);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        selectedRows.map((row) =>
          axios.post(`https://v21.mysutera.my/api/delete-location/${row.locationId}/`)
        )
      );

      setIsModalOpen(false);

      Swal.fire({
        title: 'Deleted!',
        html: `Successfully deleted:<br><strong>${selectedNames}</strong>`,
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        // Refresh data from server instead of updating local state
        fetchData();
        setSelectedRows([]);
        setToggleDelete((prev) => !prev);
      });
    } catch (error) {
      console.error('Failed to delete locations:', error);
      alert('An error occurred while deleting. Please try again.');
      setIsModalOpen(false);
    }
  };

  return (
    <Fragment>
      {selectedRows.length > 0 && (
        <div className="d-none d-sm-block mb-2">
          <Btn attrBtn={{ color: 'danger', onClick: handleDelete }}>Delete</Btn>
        </div>
      )}

      <DataTable
        data={[...filteredData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
        columns={Columns(fetchData)}
        striped
        center
        pagination
        selectableRows
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleDelete}
      />

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        locationName={selectedNames}
      />
    </Fragment>
  );
};

export default LocationTableComponent;
