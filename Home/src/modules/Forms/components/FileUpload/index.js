import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { onChangeTrigger } from "../../../helpers";

class FileUpload extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props);
        this.state = { file: '' };
        this.hiddenFileInput = React.createRef();
    }

    handleChange = async (event) => {
        const { dispatch, actions, name } = this.props;
        if(event.target.files.length > 0) {
            const file = event.target.files[0];
            if(name && name.length > 0) {
                const formData = new FormData();
                formData.append('uploadfile', event.target.files[0]);
                await dispatch({
                    type: "change_input",
                    payload: {name: event.target.name, value: formData}
                });
            }

            onChangeTrigger(actions, dispatch);

            this.setState({ file });
        }
    }

    render() {
        const { style, children } = this.props;

        if(children && React.Children.toArray(children).length > 0) {
            return (
                 <div onClick={() => this.hiddenFileInput.current.click()} style={style}
                      {...this.props.inline}
                 >
                    {children}
                    <input
                        ref={this.hiddenFileInput}
                        style={{display:"none"}}
                        name={this.props.name}
                        onChange={this.handleChange}
                        type="file"
                    />
                </div>
            );
        }

        return (
             <input
                ref={this.hiddenFileInput}
                name={this.props.name}
                onChange={this.handleChange}
                type="file"
                {...this.props.inline}
            />
        );
    }
}

FileUpload.propTypes = {
    style: PropTypes.object,
    name: PropTypes.string,
};
FileUpload.defaultProps = {
    style: {},
    name: '',
};

export default connect () (FileUpload);
