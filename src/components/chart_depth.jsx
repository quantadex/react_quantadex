import React, { Component } from "react";
import { connect } from 'react-redux'
import Highchart from 'highcharts'
import lodash from 'lodash';
import Utils from '../common/utils.js'

class DepthChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentTicker: this.props.currentTicker
        }
    }

    update(bids, asks, ticker, init = false) {
        let bidsData = []
        let asksData = []
        let totalBids = 0
        let totalAsks = 0
        let mid, min, max
        
        const comp = this.props.currentTicker && this.props.currentTicker.split("/") || ["",""]
        const base = comp[0].split("0X")
        const counter = comp[1].split("0X")
        const precision = window.marketsHash[this.props.currentTicker] && window.marketsHash[this.props.currentTicker].pricePrecision || 5

        bids.dataSource.map(order => {
            totalBids += parseFloat(order.amount)
            bidsData.push([Number(Utils.maxPrecision(parseFloat(order.price), precision)), Number(Utils.maxPrecision(totalBids, precision))])
        })
        bidsData.reverse()
        asks.dataSource.map(order => {
            totalAsks += parseFloat(order.amount)
            asksData.push([Number(Utils.maxPrecision(parseFloat(order.price), precision)), Number(Utils.maxPrecision(totalAsks, precision))])
        })
        
        if (bidsData.length > 0 && asksData.length > 0) {
            mid = (asksData[0][0] + bidsData[bidsData.length - 1][0])/2
            min = mid * 0.4
            max = mid * 1.6

            let lowest = bidsData[0][0]
            let highest = asksData[asksData.length - 1][0]

            if (max < asksData[0][0]) {
				max = asksData[0][0] * 1.5;
			}
			if (min > bidsData[bidsData.length - 1][0]) {
				min = bidsData[bidsData.length - 1][0] * 0.5;
            }
            if(min < lowest && max > highest) {
                let gap = Math.max(mid - lowest, highest - mid)
                min = mid - gap
                max = mid + gap
            }
        } else if (bidsData.length && !asksData.length) {
			min = bidsData[bidsData.length - 1][0] * 0.4;
			max = bidsData[bidsData.length - 1][0] * 1.6;
		} else if (asksData.length && !bidsData.length) {
			min = 0;
			max = asksData[0][0] * 2;
        }
        
        const options = {
            series: [{
                name: 'Bids',
                data: bidsData,
                color: '#03a7a8'
            }, {
                name: 'Asks',
                data: asksData,
                color: '#fc5857'
            }]
        }
        
        if (init || window.depthChartWidget.xAxis[0].min == undefined) {
            options.title = { text: `${base[0]}${(base[1] ? "0x" + base[1].substr(0, 4) : "")}/${counter[0]}${(counter[1] ? "0x" + counter[1].substr(0, 4) : "")}` }
            options.xAxis = { min: min,  max: max }
        }
        
        window.depthChartWidget.update(options)
    }

    componentDidMount() {
        window.depthChartWidget = Highchart.chart("depth_chart_container", {
            chart: {
                type: 'area',
                backgroundColor: this.props.mobile ? "#121517" : "#23282c"
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
                maxPadding: 0
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
                },
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size=10px;">Price: {point.key}</span><br/>'
            },
            series: [{
                name: 'Bids',
                data: [],
                step: 'right',
                color: '#03a7a8'
            }, {
                name: 'Asks',
                data: [],
                step: 'left',
                color: '#fc5857'
            }],
        })
        
        setTimeout(() => {
            this.update(this.props.bids, this.props.asks, this.props.currentTicker, true)
        }, 1000)
    }

    componentWillReceiveProps(nextProp) {
        setTimeout(() => {
            if (nextProp.currentTicker != this.state.currentTicker) {
                this.setState({currentTicker: nextProp.currentTicker})
                this.update(nextProp.bids, nextProp.asks, nextProp.currentTicker, true)
            } else {
                this.update(nextProp.bids, nextProp.asks, nextProp.currentTicker)
            }
        }, 1000)
    }

    handleScroll = lodash.throttle((delta) => {
        let min = window.depthChartWidget.xAxis[0].min
        let max = window.depthChartWidget.xAxis[0].max
        let mid = (min + max)/2
        let inc = mid * 0.2

        if (delta > 0) {
            min -= inc
            max += inc
        } else {
            min += inc
            max -= inc
        }

        if (min < mid && max > mid) {
            window.depthChartWidget.update({
                xAxis: {
                    min: min,
                    max: max
                }
            })
        }
        
    }, 200, {leading: true, trailing: false})

    render() {
        return (
            <div className={this.props.className} onWheel={(e) => {
                e.preventDefault();
                this.handleScroll(e.deltaY);
            }} >
            <div id="depth_chart_container" style={this.props.style || {}} />
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