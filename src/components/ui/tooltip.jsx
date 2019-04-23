import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip'

class ToolTip extends Component {
	render() {
		return (
			<div style={this.props.style}>
				<span className="fa fa-question-circle" data-tip={this.props.message}><img src={devicePath("public/images/question.png")} /></span>
				<ReactTooltip clickable={true} multiline={true}/>
			</div>
		);
	}
}

export default ToolTip; 