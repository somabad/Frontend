import React, { useState, useEffect } from 'react'; // Import useEffect here
import { Container, Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import { Input } from 'antd';
import LocationTableComponent from './LocationTableComponent';
import AddNewLocation from '../../common/AddNewLocation';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Loader from '../../Loader'; // Import Loader component

const { Search } = Input;

const LocationTable = () => {
  const [searchText, setSearchText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();  // Initialize navigate hook

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Use useEffect to handle session check and loading
  useEffect(() => {
    // Check sessionStorage for staffId and userType
    const staffId = sessionStorage.getItem('staffId');
    const userType = sessionStorage.getItem('userType');

    if (!staffId || userType === 'Staff') {
      // Redirect to login if conditions are met using navigate
      navigate('/login');
    } else {
      // Simulate loading data with a timeout (for example purposes)
      setTimeout(() => {
        setLoading(false);  // Hide loader after 3 seconds
      }, 3000);
    }
  }, [navigate]);

  return (
    <div style={{ paddingTop: '30px' }}>
      <Loader show={loading} /> {/* Show loader while loading */}
      <Container fluid={true}>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ color: '#555555' }}>
                  Location Table
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <Search
                    placeholder="Search locations..."
                    allowClear
                    onSearch={(value) => setSearchText(value)}
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    style={{ width: 200, marginRight: '10px' }}
                  />
                  <div className="d-none d-sm-block">
                    <AddNewLocation buttonLabel="Add New Location" onSuccess={handleRefresh} />
                  </div>
                  <div className="d-block d-sm-none">
                    <AddNewLocation buttonLabel={<i className="fa fa-plus" />} onSuccess={handleRefresh} />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <LocationTableComponent searchText={searchText} key={refreshKey} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LocationTable;
