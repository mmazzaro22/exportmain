import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { onLoadTrigger, getTriggerEvents } from "../../../helpers";

class DivBlock extends PureComponent { // eslint-disable-line react/prefer-stateless-function 
    constructor(props) {
        super(props);
        const { actions, dispatch } = props;
        this.state = {
            events: getTriggerEvents(actions, dispatch),
        }
    }

    componentWillMount() {
        const { actions, dispatch } = this.props;
        onLoadTrigger(actions, dispatch)
    }

    componentDidUpdate(prevProps, prevState) {
        const { actions, dispatch } = this.props;
        if(actions !== prevProps.actions) {
            this.setState({events: getTriggerEvents(actions, dispatch)})
        }
    }

    render() {
        const { className, style, tag, id, actions, dispatch, draggable, isEdit } = this.props;

        const { events } = this.state;
        
        switch (tag) {
            case 'address':
                 return (
                    <address
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </address>
                );

            case 'article':
                 return (
                    <article
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </article>
                );

            case 'aside':
                 return (
                    <aside
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </aside>
                );

            case 'div':
                 return (
                   <div
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                   >
                       {this.props.children}
                   </div>
                );

            case 'figure':
                return (
                    <figure
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </figure>
                );

            case 'footer':
                return (
                    <footer
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </footer>
                );

            case 'header':
                return (
                    <header
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </header>
                );

            case 'main':
                return (
                    <main
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </main>
                );

            case 'nav':
                return (
                    <nav
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </nav>
                );

            case 'section':
                return (
                    <section 
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </section>
                );
            default:
                return (
                    <div
                        draggable={draggable && !isEdit}
                        id={id} 
                        className={className} 
                        style={style} 
                        {...events} 
                        {...this.props.inline}
                    >
                        {this.props.children}
                    </div>
                );
        }
    }
}

DivBlock.propTypes = {
    style: PropTypes.object,
};

DivBlock.defaultProps = {
    style: {},
};

export default connect () (DivBlock);
