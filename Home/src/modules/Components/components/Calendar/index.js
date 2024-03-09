import React, { useState } from 'react';
import PropTypes from 'prop-types';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { Calendar } from 'react-modern-calendar-datepicker';
import { connect } from 'react-redux';
// eslint-disable-next-line no-redeclare
const CalendarComponent = (props) => { // eslint-disable-line react/prefer-stateless-function
    const [selectedDay, setSelectedDay] = useState(null);

    const handleChange = (date) => {
        setSelectedDay(date);
        const formattedDate = new Date(date.year, date.month, date.day).toISOString();


        const { dispatch, name } = props;
        if(name) {
            dispatch({
                type: "change_input",
                payload: { date: formattedDate },
            });
        }
    };

    return (
        <Calendar
            value={selectedDay}
            onChange={handleChange}
            shouldHighlightWeekends
            {...props.inline}
        />
    );
};

CalendarComponent.propTypes = {
    style: PropTypes.object,
};
CalendarComponent.defaultProps = {
    style: {},
};

export default connect()(CalendarComponent) ;
