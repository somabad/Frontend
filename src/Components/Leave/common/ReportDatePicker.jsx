import React, { Fragment, useState } from 'react';
import { Col, Form, FormGroup, Label, Row } from 'reactstrap';
import {
    SelectDateWithTime, CustomDateFormat, TodayButton,
    DisableDaysOfWeek, InlineVersion, DisableDatepicker, SelectTimeOnly, Default
} from "../../../Constant/indexmy";
import DatePicker from "react-datepicker";
import { DatePicker as RsuiteDatePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import ChildDatepicker from './ChildDatepicker';

const DatePickersData = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [rsuiteDate, setRsuiteDate] = useState(null);

    const today = new Date();
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Fragment>
            <Form className="theme-form">
                <div className="container-fluid">
                    <FormGroup>
                        {/* Centered Label */}
                        <Row>
                            <Col md={{ size: 5, offset: 4 }} sm="12" className="text-center">
                                <Label className="form-label mb-2 d-block text-nowrap">
                                    Select Date (Range)
                                </Label>
                            </Col>
                        </Row>
                        <Row className="g-3">
                            <Col md={{ size: 4, offset: 3 }} sm="12">
                                <div className="datepicker-here" data-language="en">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(dates) => {
                                            const [start, end] = dates;
                                            setStartDate(start);
                                            setEndDate(end);
                                        }}
                                        startDate={startDate}
                                        endDate={endDate}
                                        selectsRange
                                        inline
                                        maxDate={lastDayOfLastMonth}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {(startDate || endDate) && (
                            <Row className="mt-3">
                                <Col md={{ size: 7, offset: 3 }} sm="12">
                                    <strong>Selected Range:</strong><br />
                                    {formatDate(startDate)} — {formatDate(endDate)}
                                </Col>
                            </Row>
                        )}
                    </FormGroup>

                </div>
            </Form>
        </Fragment>
    );
};

export default DatePickersData;
