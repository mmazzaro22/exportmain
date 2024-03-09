import React from 'react';
import PropTypes from 'prop-types';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import DatePicker from 'react-modern-calendar-datepicker';
import { connect } from 'react-redux';
import TimePicker from 'react-time-picker';

import { onLoadTrigger, onChangeTrigger, getTriggerEvents } from "../../../helpers";

import moment from 'moment';

// eslint-disable-next-line no-redeclare
class DatePickerComponent extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
        const now = new Date();
        this.state = {
            date: {
                year: now.getUTCFullYear(),
                month: now.getUTCMonth() + 1,
                day: now.getUTCDate()
            },
            time: "00:00"
        }
    }

    componentDidMount() {
        this.handleDateChange(this.state.date, true);
    }

    zeroPad(number) {
        if(number < 10) {
            return `0${number}`;
        } else {
            return number;
        }
    }

     getDateTime = () => {
        try {
            const { date, time } = this.state;
            let dateString = date.year + "-" + this.zeroPad(date.month) + "-" + date.day;


            let dateTime;
            if(this.props.withTimePicker && time) {
                dateTime = moment(`${dateString} ${time}`, 'YYYY-MM-DD HH:mm:ss');
            } else {
                dateTime = new Date(dateString);
            }

            return dateTime.toISOString();
        } catch(e) {
            console.warn(e);
        }
        
        return new Date();
    }

    handleDateChange = (date, onLoad) => {
        this.setState({ date }, () => {
            const { dispatch, name, actions, changeInput } = this.props;
            if(name) {
                const dateTimeString = this.getDateTime();
                console.log(dateTimeString)
                changeInput({ name, value: dateTimeString }).then(() => {
                    if(!onLoad) {
                        onChangeTrigger(actions, dispatch);
                    }
                });
            }
        });
    }

    handleTimeChange = (time) => {
        this.setState({ time }, () => {
            const { dispatch, name, actions } = this.props;
            if(name) {
                const dateTimeString = this.getDateTime();
                dispatch({
                    type: "change_input",
                    payload: {name: name, value: dateTimeString},
                });

                //onChangeTrigger(actions, dispatch);
            }
        });
    }

    render() {
        const {
            className,
            timePickerClassName,
            datePickerClassName,
            withTimePicker,
            style
        } = this.props;

        const { date, time } = this.state;

        let content;
        if(withTimePicker) {
            content = (
                <div className={className} style={style}
                     {...this.props.inline}
                >
                    <DatePicker
                        inputClassName={datePickerClassName}
                        inputPlaceholder={this.props.placeHolder}
                        value={date}
                        onChange={this.handleDateChange}
                        shouldHighlightWeekends
                    />
                    <TimePicker
                        clockIcon={null}
                        clearIcon={null}
                        className={timePickerClassName}
                        onChange={this.handleTimeChange}
                        value={time}
                    />
                </div>
            );
        } else {
            content = (
                <DatePicker
                    inputClassName={className}
                    inputPlaceholder={this.props.placeHolder}
                    value={date}
                    onChange={this.handleDateChange}
                    shouldHighlightWeekends
                    {...this.props.inline}
                />
            );
        }

        return content;
    }
};

DatePickerComponent.propTypes = {
    style: PropTypes.object,
};
DatePickerComponent.defaultProps = {
    style: {},
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeInput: (payload) => {
            dispatch({ type: 'change_input', payload });
            return Promise.resolve();
        },
        dispatch: dispatch
    }
}

export default connect(null, mapDispatchToProps) (DatePickerComponent);
