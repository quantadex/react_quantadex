import React, { Component } from "react";
import { connect } from 'react-redux'
import Highchart from 'highcharts'
import lodash from 'lodash';

class DepthChart extends Component {
    update(bids, asks, ticker) {

        // console.log("!!!", props.bids.dataSource[1])
        let bidsData = []
        let asksData = []
        let totalBids = 0
        let totalAsks = 0
        let mid, min, max

        bids.dataSource.map(order => {
            totalBids += parseFloat(order.amount)
            bidsData.push([parseFloat(order.price), totalBids])
        })
        bidsData.reverse()
        asks.dataSource.map(order => {
            totalAsks += parseFloat(order.amount)
            asksData.push([parseFloat(order.price), totalAsks])
        })
        // console.log("!!!", bidsData, asksData)
        if (bidsData.length > 0 && asksData.length > 0) {
            mid = (asksData[0][0] + bidsData[bidsData.length - 1][0])/2
            min = mid * 0.4
            max = mid * 1.6

            if (max < asksData[0][0]) {
				max = asksData[0][0] * 1.5;
			}
			if (min > bidsData[bidsData.length - 1][0]) {
				min = bidsData[bidsData.length - 1][0] * 0.5;
			}
        } else if (bidsData.length && !asksData.length) {
			min = bidsData[bidsData.length - 1][0] * 0.4;
			max = bidsData[bidsData.length - 1][0] * 1.6;
		} else if (asksData.length && !bidsData.length) {
			min = 0;
			max = asksData[0][0] * 2;
		}

        window.depthChartWidget.update({
            title: {text: ticker},
            xAxis: {
                min: min,
                max: max
            },
            series: [{
                name: 'Bids',
                data: bidsData,
                color: '#03a7a8'
            }, {
                name: 'Asks',
                data: asksData,
                color: '#fc5857'
            }]
        })
    }

    componentDidMount() {
        window.depthChartWidget = Highchart.chart("depth_chart_container", {
            chart: {
                type: 'area',
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
            this.update(this.props.bids, this.props.asks, this.props.currentTicker)
        }, 1000)
    }

    componentWillReceiveProps(nextProp) {
        setTimeout(() => {
            this.update(nextProp.bids, nextProp.asks, nextProp.currentTicker)
        }, 1000)
    }

    handleScroll = lodash.throttle((e) => {
        let min = window.depthChartWidget.xAxis[0].min
        let max = window.depthChartWidget.xAxis[0].max

        min = min * 0.4
        max = max * 1.6

        window.depthChartWidget.update({
            xAxis: {
                min: min,
                max: max
            }
        })
    }, 1000)

    render() {
        return (
            <div {...this.props}>
             {/* onWheel={(e) => {
                e.preventDefault();
                this.handleScroll(e);
            }} > */}
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