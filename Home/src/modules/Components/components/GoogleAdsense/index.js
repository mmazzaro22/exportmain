import React, { PureComponent } from 'react';
import { connect } from "react-redux";

// eslint-disable-next-line no-redeclare
class GoogleAdsense extends PureComponent { // eslint-disable-line react/prefer-stateless-function
	componentDidMount () {
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	}

	render() {
		const { className, style, dataAdClient, dataAdSlot, dataAdFormat } = this.props;
		return (
			<ins 
				className={(className ? className : '') + ' adsbygoogle'}
				style={style}
				data-ad-client={dataAdClient}
				data-ad-slot={dataAdSlot}
				data-ad-format={dataAdFormat} 
			/>
		)
	}
};

GoogleAdsense.propTypes = {
		
};
GoogleAdsense.defaultProps = {
	 
};

const mapStateToProps = function(state){
	return {
		store: state.reducer,
	}
}

export default connect(mapStateToProps, null) (GoogleAdsense);
