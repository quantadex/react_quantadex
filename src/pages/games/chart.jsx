import React, { Component } from "react";
import Highchart from 'highcharts'

export default class Chart extends Component {
    update(data) {
        const options = {
            series: [{
                data: data,
                color: '#fff'
            }]
        }
        
        window.depthChartWidget.update(options)
    }

    componentDidMount() {
        window.depthChartWidget = Highchart.chart("chart_container", {
            chart: {
                type: 'line',
                backgroundColor: "transparent"
            },
            title: {
                text: "",
                style: {
                    color: '#999'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    format: '{value:.2f}',
                    style: {
                        color: '#fff'
                    }
                },
                gridLineColor: 'transparent'
            },
            xAxis: {
                labels: {
                    style: {
                        color: '#fff'
                    }
                },
                gridLineColor: '#fff'
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
                color: '#fff',
                negativeFillColor: '#fff'
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