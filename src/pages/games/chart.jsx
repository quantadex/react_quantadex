import React, { Component } from "react";
import Highchart from 'highcharts'

export default class Chart extends Component {
    update(data) {
        const options = {
            series: [{
                data: data,
                color: '#03a7a8'
            }]
        }
        
        window.depthChartWidget.update(options)
    }

    componentDidMount() {
        window.depthChartWidget = Highchart.chart("chart_container", {
            chart: {
                type: 'line',
                backgroundColor: "#fff"
            },
            title: {
                text: "",
                style: {
                    color: '#999'
                }
            },
            legend: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: 'BTC'
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'BTC',
                data: [],
                color: '#03a7a8',
                negativeFillColor: '#da3c76'
            }],
        })
        
        setTimeout(() => {
            this.update([])
        }, 1000)
    }

    componentWillReceiveProps(nextProp) {
        this.update(nextProp.data)
    }

    render() {
        return (
            <div className={this.props.className}>
                <div id="chart_container" style={this.props.style || {}} />
            </div>
        );
      }
}