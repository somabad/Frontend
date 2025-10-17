import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
} from "reactstrap";
import CommonModal from "./modal";
import Swal from "sweetalert2";
import axios from "axios";

const AddPosition = ({ buttonLabel = "Add Position", onPositionAdded }) => {
  const defaultFormData = {
    name: "",
    entitlements: [],
  };

  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = () => {
    if (modal) {
      setFormData(defaultFormData);
    }
    setModal(!modal);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaveTypesRes, positionsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/leave-type-list/"),
          axios.get("http://127.0.0.1:8000/api/position-list/"),
        ]);

        setLeaveTypes(leaveTypesRes.data || []);
        setPositions(positionsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load leave types and positions data",
        });
      }
    };

    if (modal) {
      fetchData();
    }
  }, [modal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEntitlementChange = (leaveTypeId, value) => {
    const days = parseFloat(value) || 0;
    setFormData((prev) => {
      const newEntitlements = [...prev.entitlements];
      const existingIndex = newEntitlements.findIndex(
        (e) => e.leave_type_id === leaveTypeId
      );

      if (days > 0) {
        if (existingIndex >= 0) {
          newEntitlements[existingIndex].entitled_days = days;
        } else {
          newEntitlements.push({
            leave_type_id: leaveTypeId,
            entitled_days: days,
          });
        }
      } else {
        if (existingIndex >= 0) {
          newEntitlements.splice(existingIndex, 1);
        }
      }

      return {
        ...prev,
        entitlements: newEntitlements,
      };
    });
  };

  const getEntitlementValue = (leaveTypeId) => {
    const entitlement = formData.entitlements.find(
      (e) => e.leave_type_id === leaveTypeId
    );
    return entitlement ? entitlement.entitled_days : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Position name is required",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/create-position/",
        {
          name: formData.name.trim(),
          entitlements: formData.entitlements,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
      });

      setFormData(defaultFormData);
      setModal(false);

      if (onPositionAdded) {
        onPositionAdded();
      }
    } catch (error) {
      console.error("Error creating position:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create position";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="primary" onClick={toggle}>
        {buttonLabel}
      </Button>

      <CommonModal
        isOpen={modal}
        toggle={toggle}
        title="Add New Position"
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <div className="row">
            {/* LEFT SIDE: POSITION DETAILS */}
            <div className="col-md-6 mb-3">
              <Card className="shadow-sm">
                <CardHeader>
                  <h6 className="mb-0">Position Details</h6>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label for="name">Position Name *</Label>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter position name"
                      required
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </div>

            {/* RIGHT SIDE: LEAVE ENTITLEMENTS */}
            <div className="col-md-6 mb-3">
              <Card className="shadow-sm">
                <CardHeader>
                  <h6 className="mb-0">Leave Entitlements</h6>
                </CardHeader>
                <CardBody style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {leaveTypes.map((leaveType) => (
                    <FormGroup key={leaveType.leave_type_id}>
                      <Label for={`entitlement_${leaveType.leave_type_id}`}>
                        {leaveType.leave_name} (Days)
                      </Label>
                      <Input
                        type="number"
                        id={`entitlement_${leaveType.leave_type_id}`}
                        value={getEntitlementValue(leaveType.leave_type_id)}
                        onChange={(e) =>
                          handleEntitlementChange(
                            leaveType.leave_type_id,
                            e.target.value
                          )
                        }
                        placeholder="0"
                        min="0"
                        step="0.5"
                      />
                    </FormGroup>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>

          {/* CREATE BUTTON (Under the form) */}
          <div className="d-flex justify-content-end mt-3 mb-4">
            <Button
              type="button"
              color="secondary"
              onClick={toggle}
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Position"}
            </Button>
          </div>

          {/* EXISTING POSITIONS TABLE */}
          <Card className="shadow-sm">
            <CardHeader>
              <h6 className="mb-0">Existing Positions</h6>
            </CardHeader>
            <CardBody>
              {positions.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover bordered>
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Position Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.position_id}>
                          <td>{position.position_id}</td>
                          <td>{position.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted mb-0">No positions created yet.</p>
              )}
            </CardBody>
          </Card>
        </Form>
      </CommonModal>
    </>
  );
};

export default AddPosition;
