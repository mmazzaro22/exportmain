import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class Spinner extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    componentDidMount () {
        this._mountNode = document.createElement('div');
        this._mountNode.style['z-index'] = '9999';
        document.body.appendChild(this._mountNode);
        ReactDOM.render(this._overlay, this._mountNode);
    }

    componentWillUnmount () {
        ReactDOM.unmountComponentAtNode(this._mountNode);
        this._mountNode = null;
    }

    componentDidUpdate () {
        if (this._mountNode) {
            ReactDOM.render(this._overlay, this._mountNode);
        }
    }

    render() {
        const { store } = this.props;
        if(store.tasks && store.tasks.size > 0) {
            this._overlay = (
                <div style={{position: 'fixed', top: '0px', left: '0px', right: '0px', bottom: '0px', zIndex: '9999'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                        <div style={{display: 'block'}}>
                           <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    </div>
                </div>
            );
        } else {
            this._overlay = (
                <span />
            );
        }
        return (
            <span />
        );
    }
}

Spinner.propTypes = {
    style: PropTypes.object,
};
Spinner.defaultProps = {
    style: {},
};

const mapStateToProps = function(state){
    return {
        store: state.reducer,
    }
}

export default connect (mapStateToProps, null) (Spinner);


