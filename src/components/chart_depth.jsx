import React, { Component } from "react";
import { connect } from 'react-redux'
import Highchart from 'highcharts'

class DepthChart extends Component {
    update(props) {
        window.depthChartWidget.update({
            title: {text: props.currentTicker},
            series: [{
                name: 'Bids',
                data: props.bids.dataSource.map(order => {
                    return [parseFloat(order.price), parseFloat(order.amount)]
                }),
                color: '#03a7a8'
            }, {
                name: 'Asks',
                data: props.asks.dataSource.map(order => {
                    return [parseFloat(order.price), parseFloat(order.amount)]
                }),
                color: '#fc5857'
            }]
        })
    }

    componentDidMount() {
        window.depthChartWidget = Highchart.chart("depth_chart_container", {
            chart: {
                type: 'area',
                zoomType: 'xy',
                backgroundColor: 'rgb(17,20,22)'
            },
            title: {
                text: this.props.currentTicker,
                align: 'left',
                style: {
                    color: '#999'
                }
            },
            xAxis: {
                gridLineColor: "#333",
                lineColor: '#333',
                minPadding: 0,
                maxPadding: 0,
                title: {
                    text: 'Price'
                }
            },
            yAxis: [{
                gridLineColor: "#333",
                lineColor: '#333',
                lineWidth: 1,
                gridLineWidth: 1,
                title: null,
                tickWidth: 1,
                tickLength: 5,
                tickPosition: 'inside',
                labels: {
                    align: 'left',
                    x: 8
                }
            }, {
                opposite: true,
                linkedTo: 0,
                lineWidth: 1,
                gridLineWidth: 0,
                lineColor: '#333',
                title: null,
                tickWidth: 1,
                tickLength: 5,
                tickPosition: 'inside',
                labels: {
                    align: 'right',
                    x: -8
                }
            }],
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillOpacity: 0.2,
                    lineWidth: 1,
                    step: 'center'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size=10px;">Price: {point.key}</span><br/>'
            },
            series: [{
                name: 'Bids',
                data: [],
                color: '#03a7a8'
            }, {
                name: 'Asks',
                data: [],
                color: '#fc5857'
            }]
        })
        
        setTimeout(() => {
            this.update(this.props)
        }, 1000)
    }

    componentWillReceiveProps(nextProp) {
        setTimeout(() => {
            this.update(nextProp)
        }, 1000)
    }

    render() {
        return (
          <div {...this.props}>
            <div id="depth_chart_container"/>
          </div>
        );
      }
}

const mapStateToProps = (state) => ({
    bids: state.app.orderBook.bids,
    asks: state.app.orderBook.asks,
    currentTicker:state.app.currentTicker,
  });

export default connect(mapStateToProps)(DepthChart)