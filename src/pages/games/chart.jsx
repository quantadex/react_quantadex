import React, { Component } from "react";
import Highchart from 'highcharts'

export default class Chart extends Component {
    update(data, height) {
        const options = {
            chart: {
                height: height
            },
            series: [{
                data: data,
                color: '#fff'
            }]
        }
        
        window.chartWidget.update(options)
    }

    componentDidMount() {
        window.chartWidget = Highchart.chart("chart_container", {
            chart: {
                type: 'line',
                backgroundColor: "transparent",
                animation: {
                    duration: 100
                }
            },
            title: {
                text: "",
                style: {
                    color: '#999'
                }
            },
            tooltip: {
                enabled: false,
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
                    style: {
                        color: '#fff'
                    }
                },
                gridLineColor: 'transparent'
            },
            xAxis: {
                title: {
                    text: 'Rolls',
                    style: {
                        color: '#fff'
                    }
                },
                tickWidth: 0,
                labels: {
                    enabled: false
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
        if (nextProp.data !== this.props.data || nextProp.style.height !== this.props.style.height) {
            this.update(nextProp.data, nextProp.style.height)
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <div id="chart_container" style={this.props.style || {}} />
            </div>
        );
      }
}